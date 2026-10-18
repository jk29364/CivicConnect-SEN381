import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate, STATUSES, SEVERITIES } from '../../api';

const card = 'rounded-lg border border-[#3e3040] p-5';

export default function StaffDashboard() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/api/requests', { role: 'staff' })
      .then((data) => { if (!cancelled) setRows(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, []);

  if (error) return <p role="alert" className="text-sm text-[#ff8a80]">Could not load the dashboard: {error}</p>;
  if (!rows) return <p className="text-sm text-[#b5cbcb]">Loading...</p>;

  const countBy = (key, values) =>
    Object.fromEntries(values.map((v) => [v, rows.filter((r) => r[key] === v).length]));
  const byStatus = countBy('status', STATUSES);
  const bySeverity = countBy('severity', SEVERITIES);
  const open = rows.filter((r) => r.status !== 'Resolved' && r.status !== 'Closed').length;
  const recent = [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <section>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className={card}><p className="text-sm text-[#b5cbcb]">Total</p><p className="mt-1 text-3xl">{rows.length}</p></div>
        <div className={card}><p className="text-sm text-[#b5cbcb]">Open</p><p className="mt-1 text-3xl">{open}</p></div>
        <div className={card}><p className="text-sm text-[#b5cbcb]">Resolved</p><p className="mt-1 text-3xl">{byStatus.Resolved}</p></div>
        <div className={card}><p className="text-sm text-[#b5cbcb]">Closed</p><p className="mt-1 text-3xl">{byStatus.Closed}</p></div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className={card}>
          <h2 className="text-sm font-medium text-[#b5cbcb]">By status</h2>
          <ul className="mt-3 text-sm">
            {STATUSES.map((s) => (
              <li key={s} className="flex justify-between py-1"><span>{s}</span><span>{byStatus[s]}</span></li>
            ))}
          </ul>
        </div>
        <div className={card}>
          <h2 className="text-sm font-medium text-[#b5cbcb]">By severity</h2>
          <ul className="mt-3 text-sm">
            {[...SEVERITIES].reverse().map((s) => (
              <li key={s} className="flex justify-between py-1">
                <span className={s === 'High' ? 'font-semibold text-[#fe571e]' : ''}>{s}</span>
                <span>{bySeverity[s]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Most recent</h2>
        <Link to="/staff/queue" className="text-sm text-[#fe571e] hover:underline">Open the full queue</Link>
      </div>
      {recent.length === 0 ? (
        <p className="mt-3 text-sm text-[#b5cbcb]">No requests yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {recent.map((r) => (
            <li key={r.id} className="flex flex-wrap justify-between gap-2 rounded-md border border-[#3e3040] px-4 py-3">
              <Link className="text-[#fe571e] hover:underline" to={`/staff/requests/${r.id}`}>{r.referenceNumber}</Link>
              <span>{r.category}</span>
              <span>{r.status}</span>
              <span className="text-[#b5cbcb]">{formatDate(r.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}