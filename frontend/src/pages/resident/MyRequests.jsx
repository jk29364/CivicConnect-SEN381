import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate } from '../../api';

export default function MyRequests() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/api/requests', { role: 'resident' })
      .then((data) => { if (!cancelled) setRows(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My requests</h1>
        <Link to="/resident/new" className="rounded-md bg-[#fe571e] px-4 py-2 text-sm font-medium text-white">
          Submit request
        </Link>
      </div>

      {error && <p role="alert" className="mt-6 text-sm text-[#ff8a80]">Could not load your requests: {error}</p>}
      {!error && rows === null && <p className="mt-6 text-sm text-[#b5cbcb]">Loading...</p>}
      {rows && rows.length === 0 && <p className="mt-6 text-sm text-[#b5cbcb]">You have not submitted any requests yet.</p>}

      {rows && rows.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-[#3e3040]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2a1830] text-[#b5cbcb]">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[#3e3040] hover:bg-[#2a1830]">
                  <td className="px-4 py-3">
                    <Link className="text-[#fe571e] hover:underline" to={`/resident/requests/${r.id}`}>
                      {r.referenceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.category}</td>
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