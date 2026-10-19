import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate } from '../../api';
import ErrorState from '../../components/ErrorState';

export default function MyRequests() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const retry = useCallback(() => {
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api('/api/requests')
      .then((data) => { if (!cancelled) setRows(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [reloadKey]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#fe571e]">Resident</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">My requests</h1>
        </div>
        <Link to="/resident/new" className="rounded-lg bg-[#fe571e] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#fe571e]/20">
          New request
        </Link>
      </div>

      {error && <ErrorState message={error} onRetry={retry} />}
      {!error && rows === null && <p className="text-sm text-[#b5cbcb]">Loading...</p>}
      {rows && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#3e3040] p-10 text-center">
          <p className="text-[#b5cbcb]">You have not submitted any requests yet.</p>
          <Link to="/resident/new" className="mt-4 inline-block text-sm text-[#fe571e] hover:underline">Submit your first request</Link>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-[#3e3040] bg-[#211224]">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-[#b5cbcb]">
              <tr className="border-b border-[#3e3040]">
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[#3e3040] hover:bg-[#2a1830]">
                  <td className="px-5 py-4">
                    <Link className="font-medium text-[#fe571e] hover:underline" to={`/resident/requests/${r.id}`}>{r.referenceNumber}</Link>
                  </td>
                  <td className="px-5 py-4">{r.category}</td>
                  <td className="px-5 py-4">{r.status}</td>
                  <td className="px-5 py-4 text-[#b5cbcb]">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}