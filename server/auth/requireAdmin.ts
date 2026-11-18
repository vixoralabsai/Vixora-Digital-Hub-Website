import { Request, Response, NextFunction } from 'express';

const DEFAULT_DEV_ADMIN_EMAILS = [
  'admin@vixoradigitalhub.com',
  'vixoralabsai@gmail.com',
  'vixoraacademy@gmail.com'
];

/**
 * Parses and normalizes the ADMIN_EMAILS environment variable.
 * Exact matching only — NO wildcard matching, NO domain-level checks like includes('@vixora...').
 */
export function getAuthorizedAdminEmails(): Set<string> {
  const envValue = process.env.ADMIN_EMAILS;

  if (envValue !== undefined) {
    const emailList = envValue
      .replace(/^["']|["']$/g, '')
      .split(',')
      .map((e) => e.trim().replace(/^["']|["']$/g, '').toLowerCase())
      .filter((e) => e.length > 0 && e.includes('@'));

    return new Set(emailList);
  }

  // Fail closed in production when ADMIN_EMAILS is unset.
  // In local development/test containers without .env secrets, allow the platform owner addresses.
  if (process.env.NODE_ENV === 'production') {
    return new Set();
  }

  return new Set(DEFAULT_DEV_ADMIN_EMAILS);
}

/**
 * requireAdmin Middleware
 * Relies on requireAuthentication having already run and populated req.user from Supabase Auth.
 * Authorizes the user by comparing their verified email against the exact ADMIN_EMAILS allowlist.
 * Never trusts any browser-supplied role, permissions, or headers.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || !req.user.email) {
    return res.status(401).json({
      error: 'Authentication required prior to admin authorization check.',
      code: 'UNAUTHENTICATED'
    });
  }

  const verifiedEmail = req.user.email.toLowerCase().trim();
  const allowedAdmins = getAuthorizedAdminEmails();

  if (!allowedAdmins.has(verifiedEmail)) {
    return res.status(403).json({
      error: 'Access denied: verified account is not an authorized administrator.',
      code: 'FORBIDDEN_NOT_ADMIN'
    });
  }

  next();
}
