import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api';
import { AuthContext } from './context';
import { clearStoredToken, decodeToken, getStoredToken, SIGNED_OUT_EVENT, storeToken } from './token';

function sessionFrom(token) {
  const claims = token ? decodeToken(token) : null;
  return claims ? { token, id: claims.id, role: claims.role } : null;
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(() => sessionFrom(getStoredToken()));

  // api.js dispatches this when the server rejects a stored token (401, or an expired token).
  useEffect(() => {
    const onSignedOut = () => setSession(null);
    window.addEventListener(SIGNED_OUT_EVENT, onSignedOut);
    return () => window.removeEventListener(SIGNED_OUT_EVENT, onSignedOut);
  }, []);

  const startSession = useCallback((token) => {
    const next = sessionFrom(token);
    if (!next) throw new Error('The server returned an unusable session. Please try again.');
    storeToken(next.token);
    setSession(next);
    return next;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const data = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
    return startSession(data.token);
  }, [startSession]);

    // Residents are signed in straight away. Staff registrations return no token: they wait for approval.
  const register = useCallback(async (email, password, role) => {
    const data = await apiFetch('/api/auth/register', { method: 'POST', body: { email, password, role } });
    if (data.token) return { signedIn: true, session: startSession(data.token) };
    return { signedIn: false, message: data.message };
  }, [startSession]);

  const logout = useCallback(() => {
    clearStoredToken();
    setSession(null);
  }, []);

  const value = useMemo(() => ({
    session,
    role: session?.role ?? null,
    userId: session?.id ?? null,
    isAuthenticated: Boolean(session),
    signIn,
    register,
    logout,
  }), [session, signIn, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}