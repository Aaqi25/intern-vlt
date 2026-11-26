import express from 'express';
import crypto from 'crypto';
import supabase from '../config/supabase.js';
import { localDatabaseStore } from '../config/localDatabaseStore.js';
import { config } from '../config/env.js';
import { hashPassword, verifyPassword, signJwt, verifyJwt } from '../utils/jwt.js';

const router = express.Router();

const normalizeRole = (rawRole = '') => {
  const lower = String(rawRole).trim().toLowerCase();
  if (
    lower.includes('candidate') ||
    lower.includes('intern') ||
    lower.includes('seeker')
  ) {
    return 'Candidate';
  }
  return 'Recruiter Admin';
};

const toPublicUser = (record) => ({
  id: record.id,
  email: record.email,
  name: record.name || `${record.firstName || ''} ${record.lastName || ''}`.trim() || record.email.split('@')[0],
  role: normalizeRole(record.role),
  candidateId: record.candidateId || null,
  organization: record.organization || 'Thozhil Enterprise Platform',
});

const findUserByEmail = async (email) => {
  // Check local store first for auth accounts, then Supabase if configured
  const { data: localUser } = await localDatabaseStore
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (localUser) return localUser;

  try {
    const { data: remoteUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (remoteUser) return remoteUser;
  } catch (_) {}

  return null;
};

const resolveCandidateId = async (email) => {
  try {
    const { data: cand } = await supabase
      .from('candidates')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    return cand?.id || null;
  } catch {
    return null;
  }
};

router.post('/register', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const fullName = String(req.body?.name || req.body?.fullName || '').trim();
    const role = normalizeRole(req.body?.role);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const candidateId = role === 'Candidate' ? await resolveCandidateId(email) : null;
    const displayName = fullName || email.split('@')[0];
    const [firstName, ...rest] = displayName.split(/\s+/);
    const newUser = {
      id: `usr_${crypto.randomUUID()}`,
      email,
      passwordHash: hashPassword(password),
      name: displayName,
      firstName: firstName || displayName,
      lastName: rest.join(' ') || '',
      role,
      candidateId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await localDatabaseStore.from('users').insert([newUser]);

    const publicUser = toPublicUser(newUser);
    const token = signJwt(
      {
        sub: publicUser.id,
        email: publicUser.email,
        role: publicUser.role,
        name: publicUser.name,
        candidateId: publicUser.candidateId,
      },
      config.jwtSecret,
      86400
    );

    return res.status(201).json({
      success: true,
      token,
      expiresIn: 86400,
      user: publicUser,
    });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body?.email || req.body?.username || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const userRecord = await findUserByEmail(email);
    if (!userRecord || !verifyPassword(password, userRecord.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (userRecord.isActive === false) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    }

    const candidateId = userRecord.candidateId || (normalizeRole(userRecord.role) === 'Candidate' ? await resolveCandidateId(email) : null);
    const publicUser = toPublicUser({ ...userRecord, candidateId });
    const token = signJwt(
      {
        sub: publicUser.id,
        email: publicUser.email,
        role: publicUser.role,
        name: publicUser.name,
        candidateId: publicUser.candidateId,
      },
      config.jwtSecret,
      86400
    );

    return res.status(200).json({
      success: true,
      token,
      expiresIn: 86400,
      user: publicUser,
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({ success: false, message: 'Authentication failed.' });
  }
});

router.get('/session', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const claims = verifyJwt(token, config.jwtSecret);
  if (!claims) {
    return res.status(401).json({ authenticated: false, message: 'Invalid or expired session.' });
  }
  return res.status(200).json({
    authenticated: true,
    user: {
      id: claims.sub,
      email: claims.email,
      role: claims.role,
      name: claims.name,
      candidateId: claims.candidateId || null,
    },
  });
});

router.post('/logout', (_req, res) => {
  return res.status(200).json({ success: true });
});

export default router;
