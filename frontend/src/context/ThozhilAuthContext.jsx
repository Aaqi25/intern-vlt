import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const THOZHIL_SESSION_KEY = 'thozhil_auth_session';

const ThozhilAuthContext = createContext(null);

const readStoredThozhilSession = () => {
  try {
    const stored = localStorage.getItem(THOZHIL_SESSION_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(THOZHIL_SESSION_KEY);
      return null;
    }
    const token = parsed?.user?.token;
    if (typeof token !== 'string' || token.split('.').length !== 3) {
      localStorage.removeItem(THOZHIL_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    console.error('[ThozhilAuth] Failed reading initial session:', e);
    return null;
  }
};

export const ThozhilAuthProvider = ({ children }) => {
  const [session, setSession] = useState(readStoredThozhilSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = session?.user || null;
  const isAuthenticated = !!user;
  const role = user?.role || null;

  useEffect(() => {
    const syncSession = () => setSession(readStoredThozhilSession());
    window.addEventListener('storage', syncSession);
    window.addEventListener('interviewx:login', syncSession);
    window.addEventListener('interviewx:logout', syncSession);
    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('interviewx:login', syncSession);
      window.removeEventListener('interviewx:logout', syncSession);
    };
  }, []);

  const login = useCallback(async ({ email, password, role = 'employer' }) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login({ email, password, role });
      const synced = readStoredThozhilSession();
      setSession(synced);
      return synced;
    } catch (err) {
      const msg = err.message || 'Authentication failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncFromStorage = useCallback(() => {
    const synced = readStoredThozhilSession();
    setSession(synced);
    return synced;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ThozhilAuthContext.Provider
      value={{
        session,
        user,
        role,
        isAuthenticated,
        loading,
        error,
        login,
        syncFromStorage,
        logout
      }}
    >
      {children}
    </ThozhilAuthContext.Provider>
  );
};

export const useThozhilAuth = () => {
  const context = useContext(ThozhilAuthContext);
  if (!context) {
    throw new Error('useThozhilAuth must be used within a ThozhilAuthProvider');
  }
  return context;
};
