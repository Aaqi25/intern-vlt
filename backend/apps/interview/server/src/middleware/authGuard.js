/**
 * Authentication Guard Middleware
 *
 * Security note: The current authentication model relies on client-supplied
 * headers (X-User-Role, X-User-Email) rather than cryptographically verified
 * JWT tokens. This is a known limitation documented in the security audit.
 *
 * This guard provides a first line of defense by:
 * 1. Blocking requests with no Authorization header on protected routes.
 * 2. Sanitizing role and email headers to prevent header injection attacks.
 * 3. Enforcing that the role value is from a known set of allowed roles.
 *
 * PRODUCTION UPGRADE PATH:
 * Replace this guard with proper JWT signature verification using:
 *   import jwt from 'jsonwebtoken';
 *   const payload = jwt.verify(token, config.jwtSecret);
 * This requires the frontend to issue real signed tokens from a server-side
 * auth endpoint (e.g. POST /api/auth/login) instead of client-generated tokens.
 */

import ApiError from '../utils/ApiError.js';

/** Allowed role values to prevent header injection / role escalation */
const ALLOWED_ROLES = new Set([
  'recruiter admin',
  'recruiter',
  'employer',
  'candidate',
  'authority',
  'intern',
  ''
]);

/**
 * requireAuth — blocks requests with no Bearer token.
 * Use this middleware on routes that must require an authenticated session.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ') || authHeader.length <= 7) {
    return next(new ApiError(401, 'Authentication required. Please sign in to continue.'));
  }
  next();
};

/**
 * sanitizeRoleHeader — normalizes and validates the X-User-Role header.
 * Prevents role elevation via arbitrary string injection.
 * Applied globally after authenticate() in app.js.
 */
export const sanitizeRoleHeader = (req, res, next) => {
  const rawRole = (req.headers['x-user-role'] || '').trim().toLowerCase();

  // Reject roles not in the known set to prevent escalation injection
  if (rawRole && !ALLOWED_ROLES.has(rawRole)) {
    // Don't block the request — just zero out the invalid role.
    // This prevents silent escalation while not breaking legitimate clients.
    req.headers['x-user-role'] = '';
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Security] Rejected unknown X-User-Role header value: "${rawRole}" from ${req.ip}`);
    }
  }

  // Sanitize email header — only allow valid email format characters
  const rawEmail = req.headers['x-user-email'] || '';
  if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    req.headers['x-user-email'] = '';
  }

  next();
};

export default { requireAuth, sanitizeRoleHeader };
