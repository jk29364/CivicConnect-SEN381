// Thin wrapper around the CivicConnect API.
// Tokens come from .env.local. Dev-only: VITE_ values are visible in the browser bundle.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKENS = {
  resident: import.meta.env.VITE_RESIDENT_TOKEN || '',
  staff: import.meta.env.VITE_STAFF_TOKEN || '',
};

export async function api(path, { role = 'resident', method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (TOKENS[role]) headers.Authorization = `Bearer ${TOKENS[role]}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = Array.isArray(data.details) ? data.details : [];
    throw err;
  }
  return data;
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