import apiClient from './apiClient';

/**
 * InterviewX AI — Authentication & Session Service
 * Authenticates via server-side /api/auth/* endpoints and persists verified JWT sessions.
 */

const SESSION_KEY = 'interviewx_auth_session';
const SETTINGS_KEY = 'interviewx_workspace_settings';

const isSignedJwt = (token) => typeof token === 'string' && token.split('.').length === 3;

const persistSession = (data) => {
  if (!data?.token || !data?.user || !isSignedJwt(data.token)) {
    throw new Error('Authentication server did not return a valid session token.');
  }
  const expiresInMs = (data.expiresIn || 86400) * 1000;
  const expiresAt = Date.now() + expiresInMs;
  const rawRole = String(data.user.role || '').toLowerCase();
  const cleanRole = rawRole.includes('candidate') || rawRole.includes('intern') ? 'candidate' : 'employer';

  const session = {
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      candidateId: data.user.candidateId || null,
      organization: data.user.organization || 'Thozhil Enterprise Platform',
      avatarUrl: null
    },
    token: data.token,
    expiresAt
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem('thozhil_auth_session', JSON.stringify({
    user: { ...session.user, token: data.token },
    role: cleanRole,
    expiresAt
  }));
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('auth_user', JSON.stringify({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: cleanRole === 'employer' ? 'authority' : 'intern'
  }));
  window.dispatchEvent(new Event('interviewx:login'));
  return session;
};

// Session initialized from authoritative Thozhil platform or local session
const getInitialSession = () => {
  try {
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      if (!isSignedJwt(parsed.token)) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('thozhil_auth_session');
        return null;
      }
      return parsed;
    }

    const tzSessionStr = localStorage.getItem('thozhil_auth_session');
    if (tzSessionStr) {
      const tzSession = JSON.parse(tzSessionStr);
      const token = tzSession?.user?.token;
      if (tzSession && (!tzSession.expiresAt || Date.now() <= tzSession.expiresAt) && isSignedJwt(token)) {
        return {
          user: tzSession.user,
          token,
          expiresAt: tzSession.expiresAt
        };
      }
      localStorage.removeItem('thozhil_auth_session');
    }

    return null;
  } catch (err) {
    console.error('[AuthService] Failed to load session:', err);
    return null;
  }
};

export const authService = {
  getSession: () => getInitialSession(),

  // Authenticate user against backend /api/auth/login
  login: async ({ email, password, role = 'Recruiter Admin' }) => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid work email address.');
    }
    if (!password) {
      throw new Error('Password is required.');
    }
    const { data } = await apiClient.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
      role
    });
    return persistSession(data);
  },

  // Register user against backend /api/auth/register
  register: async ({ name, email, password, role = 'Recruiter Admin' }) => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid work email address.');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    const { data } = await apiClient.post('/auth/register', {
      name: (name || '').trim(),
      email: email.trim().toLowerCase(),
      password,
      role
    });
    return persistSession(data);
  },

  // Perform genuine sign out
  logout: async () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('thozhil_auth_session');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.dispatchEvent(new Event('interviewx:logout'));
    } catch (err) {
      console.error('[AuthService] Logout error:', err);
      throw new Error('Unable to sign out. Please try again.');
    }
    return true;
  },

  // Update current user profile
  updateProfile: async (updates) => {
    const session = authService.getSession();
    if (!session) throw new Error('No active session to update.');

    const updatedSession = {
      ...session,
      user: {
        ...session.user,
        ...updates
      }
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return updatedSession.user;
  },

  getInitialSession
};

export default authService;
