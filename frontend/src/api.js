import { clearStoredToken, getStoredToken, SIGNED_OUT_EVENT } from './auth/token';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(message, { status = 0, details = [], code = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

function buildUrl(path, query) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });
  return url;
}

/**
 * Interceptor: attaches the stored JWT to every call, parses errors into ApiError,
 * and signs the user out when the server rejects the token.
 */
export async function apiFetch(path, { method = 'GET', body, query } = {}) {
  const headers = { Accept: 'application/json' };
  const token = getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.');
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 || (res.status === 403 && /token/i.test(data.message ?? ''))) {
    clearStoredToken();
    window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
  }

  if (!res.ok) {
        throw new ApiError(`Cannot reach the backend at ${BASE}. Check that it is running (npm run dev) and try again.`);
  }
  return data;
}

/** Name used by existing pages. The `role` option is ignored: the signed-in token decides identity. */
export function api(path, options = {}) {
  return apiFetch(path, { method: options.method, body: options.body, query: options.query });
}

export const CATEGORIES = ['Maintenance', 'Security', 'Common Area', 'Lost Property'];
export const SEVERITIES = ['Low', 'Medium', 'High'];
export const STATUSES = ['New', 'Assigned', 'InProgress', 'Resolved', 'Closed'];

// Mirrors the server's transition table. The server is the authority; this only limits the UI.
export const ALLOWED_NEXT = {
  New: ['Assigned', 'Closed'],
  Assigned: ['InProgress', 'New', 'Closed'],
  InProgress: ['Resolved'],
  Resolved: ['Closed', 'InProgress'],
  Closed: [],
};

export function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}