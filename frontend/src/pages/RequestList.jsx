import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, STATUSES, formatDate } from '../api';

const field = 'rounded-md border border-[#3e3040] bg-[#160a18] px-3 py-2 text-sm text-[#f2dcf1]';

export default function RequestList() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    api(`/api/requests${qs}`, { role: 'staff' })
      .then((data) => { if (!cancelled) { setRows(data); setError(null); } })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [status]);

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
      {!error && rows && visible.length === 0 && (
        <p className="mt-6 text-sm text-[#b5cbcb]">No requests match.</p>
      )}

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
                  <td className="px-4 py-3">{r.severity}</td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}