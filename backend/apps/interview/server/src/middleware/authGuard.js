/**
 * Authentication Guard Middleware
 *
 * Verifies HS256 JWT signatures using config.jwtSecret and sanitizes
 * optional metadata headers to prevent header-injection attacks.
 */

import ApiError from '../utils/ApiError.js';
import { config } from '../config/env.js';
import { verifyJwt } from '../utils/jwt.js';

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
 * requireAuth — verifies the signed Bearer JWT on protected routes.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ') || authHeader.length <= 7) {
    return next(new ApiError(401, 'Authentication required. Please sign in to continue.'));
  }

  const token = authHeader.slice(7).trim();
  const claims = verifyJwt(token, config.jwtSecret);
  if (!claims) {
    return next(new ApiError(401, 'Invalid or expired authentication token. Please sign in again.'));
  }

  req.authClaims = claims;
  next();
};

/**
 * sanitizeRoleHeader — normalizes and validates the X-User-Role header.
 * Prevents role elevation via arbitrary string injection.
 */
export const sanitizeRoleHeader = (req, res, next) => {
  const rawRole = (req.headers['x-user-role'] || '').trim().toLowerCase();

  if (rawRole && !ALLOWED_ROLES.has(rawRole)) {
    req.headers['x-user-role'] = '';
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Security] Rejected unknown X-User-Role header value: "${rawRole}" from ${req.ip}`);
    }
  }

  const rawEmail = req.headers['x-user-email'] || '';
  if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    req.headers['x-user-email'] = '';
  }

  next();
};

export default { requireAuth, sanitizeRoleHeader };
