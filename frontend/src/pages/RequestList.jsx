import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ALLOWED_NEXT, ApiError, formatDate, STATUSES } from '../api';
import { useAuth } from '../auth/useAuth';
import Toast from '../components/Toast';

const field = 'rounded-md border border-[#3e3040] bg-[#160a18] px-3 py-2 text-sm text-[#f2dcf1]';

export default function RequestList() {
  const { role } = useAuth();
  const canAct = role === 'Staff' || role === 'Agent';

  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const dismissToast = useCallback(() => setToast(null), []);
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    const params = status ? { status } : undefined;
    api('/api/requests', { query: params })
      .then((data) => { if (!cancelled) { setRows(data); setError(null); } })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [status, reloadKey]);

  async function advance(request, nextStatus) {
    setBusyId(request.id);
    try {
      await api(`/api/requests/${request.id}/status`, {
        method: 'PUT',
        body: { status: nextStatus, version: request.version },
      });
      setToast({ tone: 'ok', text: `${request.referenceNumber} moved to ${nextStatus}.` });
      refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setToast({ tone: 'error', text: 'This request was changed by someone else. The list has been refreshed.' });
        refresh();
      } else {
        setToast({ tone: 'error', text: err.message });
      }
    } finally {
      setBusyId(null);
    }
  }

  const q = query.trim().toLowerCase();
  const visible = (rows ?? []).filter((r) =>
    !q || [r.referenceNumber, r.category, r.location].some((v) => String(v ?? '').toLowerCase().includes(q)));

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold">Staff queue</h1>
        <div className="flex gap-3">
          <input className={field} placeholder="Search reference, category, location"
            value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error && <p role="alert" className="mt-6 text-sm text-[#ff8a80]">Could not load requests: {error}</p>}
      {!error && rows === null && <p className="mt-6 text-sm text-[#b5cbcb]">Loading...</p>}
      {!error && rows && visible.length === 0 && <p className="mt-6 text-sm text-[#b5cbcb]">No requests match.</p>}

      {visible.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-[#3e3040]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2a1830] text-[#b5cbcb]">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                {canAct && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-t border-[#3e3040] hover:bg-[#2a1830]">
                  <td className="px-4 py-3">
                    <Link className="text-[#fe571e] hover:underline" to={`/staff/requests/${r.id}`}>
                      {r.referenceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">{r.location}</td>
                  <td className="px-4 py-3">
                    <span className={r.severity === 'High' ? 'font-semibold text-[#fe571e]' : ''}>{r.severity}</span>
                  </td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3">{formatDate(r.createdAt)}</td>
                  {canAct && (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {(ALLOWED_NEXT[r.status] ?? []).map((next) => (
                          <button key={next} type="button" disabled={busyId === r.id}
                            onClick={() => advance(r, next)}
                            className="rounded-md border border-[#3e3040] px-2 py-1 text-xs hover:bg-[#3e3040] disabled:opacity-50">
                            {next}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Toast message={toast?.text} tone={toast?.tone} onDismiss={dismissToast} />
    </section>
  );
}