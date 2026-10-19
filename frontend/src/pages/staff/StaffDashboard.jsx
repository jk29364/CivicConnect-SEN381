import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { api, CATEGORIES, formatDate, SEVERITIES, STATUSES } from '../../api';
import ErrorState from '../../components/ErrorState';

const ORANGE = '#fe571e';
const STATUS_COLOURS = {
  New: '#fe571e', Assigned: '#ffb199', InProgress: '#c084fc', Resolved: '#7ee787', Closed: '#3e3040',
};
const SEVERITY_COLOURS = { Low: '#7ee787', Medium: '#ffb199', High: '#fe571e' };
const tooltipStyle = { background: '#1A0E1C', border: '1px solid #3e3040', borderRadius: 8, color: '#f2dcf1' };

function dayKey(date) {
  return new Date(date).toLocaleDateString('en-CA');
}

function buildStats(rows) {
  const count = (values, key) =>
    values.map((v) => ({ name: v, value: rows.filter((r) => r[key] === v).length }));

  const byStatus = count(STATUSES, 'status');
  const bySeverity = count(SEVERITIES, 'severity');
  const byCategory = CATEGORIES.map((c) => ({ name: c, value: rows.filter((r) => r.category === c).length }));

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return { key: dayKey(d), label: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), value: 0 };
  });
  rows.forEach((r) => {
    const day = days.find((d) => d.key === dayKey(r.createdAt));
    if (day) day.value += 1;
  });

  const open = rows.filter((r) => r.status !== 'Resolved' && r.status !== 'Closed');
  const resolved = rows.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
  return {
    total: rows.length,
    open: open.length,
    openHigh: open.filter((r) => r.severity === 'High').length,
    resolvedRate: rows.length ? Math.round((resolved / rows.length) * 100) : 0,
    byStatus, bySeverity, byCategory, trend: days,
    recent: [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
  };
}

function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-[#3e3040] bg-[#211224] p-5 ${className}`}>
      <h2 className="text-sm font-medium text-[#b5cbcb]">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Kpi({ label, value, hint, accent = false }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? 'border-[#fe571e]/50 bg-[#fe571e]/10' : 'border-[#3e3040] bg-[#211224]'}`}>
      <p className="text-xs uppercase tracking-wider text-[#b5cbcb]">{label}</p>
      <p className="mt-2 text-4xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#b5cbcb]">{hint}</p>}
    </div>
  );
}

export default function StaffDashboard() {
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

  const stats = useMemo(() => (rows ? buildStats(rows) : null), [rows]);

  if (error) return <ErrorState message={`Could not load the dashboard. ${error}`} onRetry={retry} />;
  if (!stats) return <p className="text-sm text-[#b5cbcb]">Loading dashboard...</p>;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#fe571e]">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Estate overview</h1>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={retry} className="rounded-lg border border-[#3e3040] px-3 py-2 text-sm hover:bg-[#211224]">Refresh</button>
          <Link to="/staff/queue" className="rounded-lg bg-[#fe571e] px-3 py-2 text-sm font-semibold text-white">Open queue</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total requests" value={stats.total} />
        <Kpi label="Open" value={stats.open} hint="Not yet resolved or closed" />
        <Kpi label="Open, high severity" value={stats.openHigh} hint="Needs attention first" accent={stats.openHigh > 0} />
        <Kpi label="Resolved or closed" value={`${stats.resolvedRate}%`} hint="Share of all requests" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Submissions, last 14 days" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ORANGE} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={ORANGE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#3e3040" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#b5cbcb" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} stroke="#b5cbcb" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="value" name="Requests" stroke={ORANGE} strokeWidth={2} fill="url(#fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="By status">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={stats.byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
                {stats.byStatus.map((s) => <Cell key={s.name} fill={STATUS_COLOURS[s.name]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#b5cbcb]">
            {stats.byStatus.map((s) => (
              <li key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: STATUS_COLOURS[s.name] }} />
                  {s.name}
                </span>
                <span className="tabular-nums text-[#f2dcf1]">{s.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="By category" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.byCategory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#3e3040" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#b5cbcb" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} stroke="#b5cbcb" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#3e3040' }} />
              <Bar dataKey="value" name="Requests" fill={ORANGE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="By severity">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.bySeverity} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <XAxis type="number" allowDecimals={false} stroke="#b5cbcb" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="#b5cbcb" tick={{ fontSize: 11 }} width={60} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#3e3040' }} />
              <Bar dataKey="value" name="Requests" radius={[0, 6, 6, 0]}>
                {stats.bySeverity.map((s) => <Cell key={s.name} fill={SEVERITY_COLOURS[s.name]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Most recent">
        {stats.recent.length === 0 ? (
          <p className="text-sm text-[#b5cbcb]">No requests yet.</p>
        ) : (
          <ul className="divide-y divide-[#3e3040] text-sm">
            {stats.recent.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link to={`/staff/requests/${r.id}`} className="font-medium text-[#fe571e] hover:underline">{r.referenceNumber}</Link>
                <span className="text-[#b5cbcb]">{r.category}</span>
                <span className={r.severity === 'High' ? 'font-semibold text-[#fe571e]' : 'text-[#b5cbcb]'}>{r.severity}</span>
                <span>{r.status}</span>
                <span className="text-[#b5cbcb]">{formatDate(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}