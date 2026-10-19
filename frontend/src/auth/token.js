export const TOKEN_KEY = 'conqr.token';
export const SIGNED_OUT_EVENT = 'conqr:signed-out';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Reads the JWT payload so the UI can show the role and hide actions.
 * It does NOT verify the signature. The server verifies every request.
 * Returns null for malformed, expired or incomplete tokens.
 */
export function decodeToken(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    if (typeof claims.exp === 'number' && claims.exp * 1000 < Date.now()) return null;
    if (!claims.id || !claims.role) return null;
    return claims;
  } catch {
    return null;
  }
}