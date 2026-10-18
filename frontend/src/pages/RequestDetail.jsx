import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api, ALLOWED_NEXT, formatDate } from '../api';

const field = 'rounded-md border border-[#3e3040] bg-[#160a18] px-3 py-2 text-sm text-[#f2dcf1]';

export default function RequestDetail( { area }) {
  const { id } = useParams();
  const location = useLocation();
  const staffView = area === 'staff';
  const role = staffView ? 'staff' : 'resident';

  const [req, setReq] = useState(null);
  const [error, setError] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [notice, setNotice] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api(`/api/requests/${id}`, { role })
      .then((data) => { if (!cancelled) { setReq(data); setError(null); } })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [id, role, reload]);

  async function changeStatus(e) {
    e.preventDefault();
    if (!nextStatus) return;
    setNotice(null);
    try {
      await api(`/api/requests/${id}/status`, {
        role: 'staff', method: 'PUT', body: { status: nextStatus, version: req.version },
      });
      setNotice({ ok: true, text: `Status changed to ${nextStatus}.` });
      setNextStatus('');
      setReload((n) => n + 1);
    } catch (err) {
      const stale = err.status === 409;
      setNotice({ ok: false, text: stale
        ? 'Someone else changed this request. The latest version has been loaded.'
        : err.message });
      if (stale) setReload((n) => n + 1);
    }
  }

  if (error) return <p role="alert" className="text-sm text-[#ff8a80]">Could not load request: {error}</p>;
  if (!req) return <p className="text-sm text-[#b5cbcb]">Loading...</p>;

  const options = ALLOWED_NEXT[req.status] ?? [];
  const reference = location.state?.reference;

  return (
    <section className="max-w-3xl">
      <Link to={staffView ? '/staff/queue' : '/resident'} className="text-sm text-[#b5cbcb] hover:text-white">
        {staffView ? 'Back to staff queue' : 'Back to my requests'}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">{req.referenceNumber}</h1>
      {reference && <p className="mt-2 text-sm text-[#b5cbcb]">Your request was received. Keep this reference.</p>}

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div><dt className="text-[#b5cbcb]">Status</dt><dd className="font-medium">{req.status}</dd></div>
        <div><dt className="text-[#b5cbcb]">Severity</dt><dd>{req.severity}</dd></div>
        <div><dt className="text-[#b5cbcb]">Category</dt><dd>{req.category}</dd></div>
        <div><dt className="text-[#b5cbcb]">Location</dt><dd>{req.location}</dd></div>
        <div className="col-span-2"><dt className="text-[#b5cbcb]">Description</dt><dd>{req.description}</dd></div>
        <div><dt className="text-[#b5cbcb]">Submitted</dt><dd>{formatDate(req.createdAt)}</dd></div>
      </dl>

      {staffView && (
        <form onSubmit={changeStatus} className="mt-8 flex items-end gap-3 rounded-lg border border-[#3e3040] p-4">
          <label className="flex flex-col gap-1 text-sm text-[#b5cbcb]">Change status
            <select className={field} value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
              <option value="">Select</option>
              {options.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <button type="submit" disabled={!nextStatus}
            className="rounded-md bg-[#fe571e] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            Update
          </button>
          {options.length === 0 && <span className="text-sm text-[#b5cbcb]">No further changes allowed.</span>}
        </form>
      )}
      {notice && (
        <p role="status" className={`mt-3 text-sm ${notice.ok ? 'text-[#7ee787]' : 'text-[#ff8a80]'}`}>{notice.text}</p>
      )}

      <h2 className="mt-10 text-lg font-semibold">History</h2>
      {req.history?.length ? (
        <ol className="mt-3 flex flex-col gap-2 text-sm">
          {req.history.map((h, i) => (
            <li key={i} className="rounded-md border border-[#3e3040] px-4 py-3">
              {h.oldStatus} to {h.newStatus}
              <span className="ml-3 text-[#b5cbcb]">{formatDate(h.changedAt)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-[#b5cbcb]">No status changes yet.</p>
      )}
    </section>
  );
}