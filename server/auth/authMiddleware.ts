import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '../supabaseAdmin.js';
import {
  getPublicSupabaseClient,
  shouldUseDevAdminFallback,
  verifyAdminDevToken
} from './adminSessionStore.js';
import './authTypes.js';

/**
 * requireAuthentication Middleware
 * Verifies Supabase Auth Bearer JWT token on the server (or HMAC dev admin token in non-production when Supabase admin is unconfigured).
 * Rejects requests with missing or invalid tokens.
 */
export async function requireAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Bearer token missing in Authorization header.',
      code: 'AUTH_TOKEN_MISSING'
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      error: 'Empty authentication token provided.',
      code: 'AUTH_TOKEN_EMPTY'
    });
  }

  // 1. In non-production when Supabase Admin is not configured, check HMAC-signed dev admin session tokens
  if (shouldUseDevAdminFallback()) {
    const devUser = verifyAdminDevToken(token);
    if (devUser) {
      req.user = {
        id: devUser.id,
        email: devUser.email,
        role: devUser.role,
        user_metadata: {
          full_name: devUser.name,
          name: devUser.name,
          role: 'admin'
        }
      };
      return next();
    }
  }

  // 2. Verify with authoritative Supabase Admin client if available, or public Supabase Auth client
  const supabase = getSupabaseAdmin() || getPublicSupabaseClient();
  if (!supabase) {
    return res.status(503).json({
      error: 'Authentication service unavailable. Supabase credentials are not configured.',
      code: 'AUTH_SERVICE_UNCONFIGURED'
    });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user || !user.email) {
      return res.status(401).json({
        error: 'Invalid, expired, or revoked authentication session.',
        code: 'AUTH_TOKEN_INVALID'
      });
    }

    req.user = {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      role: user.role,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata
    };

    next();
  } catch (err: any) {
    console.error('Error verifying Supabase authentication token:', err);
    return res.status(500).json({
      error: 'Internal error verifying session token.',
      code: 'AUTH_VERIFY_ERROR'
    });
  }
}
