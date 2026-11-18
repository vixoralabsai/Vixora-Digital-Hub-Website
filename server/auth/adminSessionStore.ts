import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../supabaseAdmin.js';

interface DevAdminAccount {
  id: string;
  email: string;
  name: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

interface DevOtpRecord {
  otp: string;
  expiresAt: number;
}

const devAdminAccounts = new Map<string, DevAdminAccount>();
const devAdminOtps = new Map<string, DevOtpRecord>();

// Ephemeral HMAC key generated per server boot in non-production
const DEV_SESSION_SECRET =
  (process.env.ADMIN_SESSION_SECRET || '').trim() ||
  crypto.randomBytes(32).toString('hex');

const TOKEN_PREFIX = 'vix_dev_adm_';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function isProductionAuthEnvironment(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function shouldUseDevAdminFallback(): boolean {
  return !isProductionAuthEnvironment() && !isSupabaseConfigured();
}

function sanitizeUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

let cachedPublicClient: SupabaseClient | null = null;

/**
 * Returns a public Supabase client initialized from environment vars (or project anon fallback)
 * so standard JWT user verification can succeed even when SUPABASE_SERVICE_ROLE_KEY is unset.
 */
export function getPublicSupabaseClient(): SupabaseClient | null {
  if (cachedPublicClient) return cachedPublicClient;

  const rawUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://xenjfszsppwqadgwzpxl.supabase.co';
  const rawAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'sb_publishable_8xjidcETDkXfYSZpQU7t_Q_su_Pmil4';

  const url = sanitizeUrl(rawUrl);
  const anonKey = rawAnonKey.trim();

  if (!url || !anonKey) {
    return null;
  }

  cachedPublicClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return cachedPublicClient;
}

function hashPasswordWithSalt(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function hasDevAdminAccount(email: string): boolean {
  return devAdminAccounts.has(email.toLowerCase().trim());
}

export function registerDevAdminAccount(
  email: string,
  password: string,
  name?: string
): { id: string; email: string; name: string } {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = (name || '').trim() || cleanEmail.split('@')[0];
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPasswordWithSalt(password, salt);
  const id = `adm-dev-${crypto.createHash('sha256').update(cleanEmail).digest('hex').slice(0, 12)}`;

  devAdminAccounts.set(cleanEmail, {
    id,
    email: cleanEmail,
    name: cleanName,
    salt,
    passwordHash,
    createdAt: new Date().toISOString()
  });

  return { id, email: cleanEmail, name: cleanName };
}

export function authenticateDevAdminAccount(
  email: string,
  password: string
):
  | { ok: true; user: { id: string; email: string; name: string } }
  | { ok: false; reason: 'NOT_FOUND' | 'INVALID_PASSWORD' } {
  const cleanEmail = email.toLowerCase().trim();
  const record = devAdminAccounts.get(cleanEmail);
  if (!record) {
    return { ok: false, reason: 'NOT_FOUND' };
  }

  const candidateHash = hashPasswordWithSalt(password, record.salt);
  const expectedBuf = Buffer.from(record.passwordHash, 'hex');
  const candidateBuf = Buffer.from(candidateHash, 'hex');

  if (
    expectedBuf.length !== candidateBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, candidateBuf)
  ) {
    return { ok: false, reason: 'INVALID_PASSWORD' };
  }

  return {
    ok: true,
    user: {
      id: record.id,
      email: record.email,
      name: record.name
    }
  };
}

export function resetDevAdminPassword(email: string, newPassword: string): boolean {
  const cleanEmail = email.toLowerCase().trim();
  const existing = devAdminAccounts.get(cleanEmail);
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPasswordWithSalt(newPassword, salt);

  if (existing) {
    existing.salt = salt;
    existing.passwordHash = passwordHash;
    return true;
  }

  registerDevAdminAccount(cleanEmail, newPassword);
  return true;
}

export function createDevOtp(email: string): string {
  const cleanEmail = email.toLowerCase().trim();
  const otp = String(crypto.randomInt(100000, 999999));
  devAdminOtps.set(cleanEmail, {
    otp,
    expiresAt: Date.now() + 15 * 60 * 1000
  });
  return otp;
}

export function verifyDevOtp(email: string, otp: string): boolean {
  const cleanEmail = email.toLowerCase().trim();
  const record = devAdminOtps.get(cleanEmail);
  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    devAdminOtps.delete(cleanEmail);
    return false;
  }

  const cleanOtp = otp.trim();
  if (cleanOtp.length !== record.otp.length) return false;

  const isMatch = crypto.timingSafeEqual(
    Buffer.from(cleanOtp, 'utf8'),
    Buffer.from(record.otp, 'utf8')
  );

  if (isMatch) {
    devAdminOtps.delete(cleanEmail);
  }
  return isMatch;
}

export function issueAdminDevToken(user: {
  id: string;
  email: string;
  name: string;
}): { token: string; expiresAt: number } {
  if (!shouldUseDevAdminFallback()) {
    throw new Error('Dev admin tokens cannot be issued in production or when Supabase admin is configured.');
  }

  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = {
    sub: user.id,
    email: user.email.toLowerCase().trim(),
    name: user.name,
    role: 'admin',
    exp: expiresAt
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sigB64 = crypto
    .createHmac('sha256', DEV_SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return {
    token: `${TOKEN_PREFIX}${payloadB64}.${sigB64}`,
    expiresAt
  };
}

export function verifyAdminDevToken(token: string): {
  id: string;
  email: string;
  name: string;
  role: string;
} | null {
  if (!shouldUseDevAdminFallback()) {
    return null;
  }

  if (!token || !token.startsWith(TOKEN_PREFIX)) {
    return null;
  }

  const body = token.slice(TOKEN_PREFIX.length);
  const parts = body.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  const expectedSigB64 = crypto
    .createHmac('sha256', DEV_SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  const sigBuf = Buffer.from(sigB64, 'utf8');
  const expectedBuf = Buffer.from(expectedSigB64, 'utf8');

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!decoded || typeof decoded.email !== 'string' || typeof decoded.exp !== 'number') {
      return null;
    }
    if (Date.now() > decoded.exp) {
      return null;
    }
    return {
      id: String(decoded.sub || 'adm-dev'),
      email: decoded.email.toLowerCase().trim(),
      name: String(decoded.name || decoded.email.split('@')[0]),
      role: String(decoded.role || 'admin')
    };
  } catch {
    return null;
  }
}

export function clearDevAdminStoresForTesting() {
  devAdminAccounts.clear();
  devAdminOtps.clear();
}
