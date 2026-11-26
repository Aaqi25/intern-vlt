import ApiError from '../utils/ApiError.js';
import supabase from '../config/supabase.js';
import { config } from '../config/env.js';
import { verifyJwt } from '../utils/jwt.js';

/**
 * Authentication and identity context resolver.
 * Derives user identity and role exclusively from a cryptographically verified JWT.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const claims = token ? verifyJwt(token, config.jwtSecret) : null;

    if (!claims) {
      req.user = null;
      return next();
    }

    const userRole = String(claims.role || '').trim();
    const userEmail = String(claims.email || '').trim().toLowerCase();
    let candidateId = claims.candidateId || null;

    const isCandidate = userRole.toLowerCase() === 'candidate' || userRole.toLowerCase() === 'intern';

    if (isCandidate && userEmail && !candidateId) {
      const { data: cand } = await supabase
        .from('candidates')
        .select('id, email, role')
        .eq('email', userEmail)
        .maybeSingle();

      if (cand) {
        candidateId = cand.id;
      }
    }

    req.user = {
      token,
      role: isCandidate ? 'Candidate' : (userRole || 'Recruiter Admin'),
      email: userEmail,
      candidateId: candidateId || null,
      id: claims.sub || candidateId || 'usr_authenticated'
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Ensures user has Recruiter authorization
 */
export const requireRecruiter = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const role = (req.user.role || '').toLowerCase();
  if (role === 'candidate') {
    return next(new ApiError(403, 'Access denied: Recruiter privileges required'));
  }

  next();
};

/**
 * Enforces candidate scoping: candidate can only access resources belonging to their candidateId
 */
export const enforceCandidateScope = (resourceCandidateIdParam = 'candidateId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (req.user.role !== 'Candidate') {
      return next();
    }

    const targetCandidateId = req.params[resourceCandidateIdParam] || req.query[resourceCandidateIdParam] || req.body[resourceCandidateIdParam];
    if (targetCandidateId && req.user.candidateId && targetCandidateId !== req.user.candidateId) {
      return next(new ApiError(403, 'Access denied: You are not authorized to access this candidate profile or assessment'));
    }

    next();
  };
};

export default {
  authenticate,
  requireRecruiter,
  enforceCandidateScope
};
