import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, CATEGORIES, SEVERITIES } from '../api';

const EMPTY = {
  category: 'Maintenance', location: '', description: '', severity: 'Low',
  faultType: '', areaName: '', itemName: '', dateLastSeen: '', incidentTime: '', threatLevel: 'Low',
};

const field = 'w-full rounded-md border border-[#3e3040] bg-[#160a18] px-3 py-2 text-sm text-[#f2dcf1]';
const label = 'flex flex-col gap-1 text-sm text-[#b5cbcb]';

export default function NewRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      category: form.category,
      location: form.location,
      description: form.description,
      severity: form.severity,
    };
    if (form.category === 'Maintenance') payload.faultType = form.faultType;
    if (form.category === 'Common Area') payload.areaName = form.areaName;
    if (form.category === 'Lost Property') {
      payload.itemName = form.itemName;
      payload.dateLastSeen = form.dateLastSeen;
    }
    if (form.category === 'Security') {
      payload.incidentTime = form.incidentTime ? new Date(form.incidentTime).toISOString() : '';
      payload.threatLevel = form.threatLevel;
    }
    try {
      const res = await api('/api/requests', { role: 'resident', method: 'POST', body: payload });
      navigate(`/resident/requests/${res.request.id}`, { state: { reference: res.referenceNumber } });
    } catch (err) {
      setError(err.details.length ? err.details.join('. ') : err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-xl">
      <h1 className="text-2xl font-semibold">Submit a service request</h1>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className={label}>Category
          <select className={field} value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>

        <label className={label}>Location
          <input className={field} value={form.location} onChange={set('location')} required />
        </label>

        <label className={label}>Description
          <textarea className={field} rows={4} value={form.description} onChange={set('description')} required />
        </label>

        <label className={label}>Severity
          <select className={field} value={form.severity} onChange={set('severity')}>
            {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>

        {form.category === 'Maintenance' && (
          <label className={label}>Fault type
            <input className={field} value={form.faultType} onChange={set('faultType')} required />
          </label>
        )}
        {form.category === 'Common Area' && (
          <label className={label}>Area name
            <input className={field} value={form.areaName} onChange={set('areaName')} required />
          </label>
        )}
        {form.category === 'Lost Property' && (
          <>
            <label className={label}>Item name
              <input className={field} value={form.itemName} onChange={set('itemName')} required />
            </label>
            <label className={label}>Date last seen
              <input type="date" className={field} value={form.dateLastSeen} onChange={set('dateLastSeen')} required />
            </label>
          </>
        )}
        {form.category === 'Security' && (
          <>
            <label className={label}>Incident time
              <input type="datetime-local" className={field} value={form.incidentTime} onChange={set('incidentTime')} required />
            </label>
            <label className={label}>Threat level
              <select className={field} value={form.threatLevel} onChange={set('threatLevel')}>
                {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </>
        )}

        {error && <p role="alert" className="text-sm text-[#ff8a80]">{error}</p>}

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving}
            className="rounded-md bg-[#fe571e] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {saving ? 'Submitting...' : 'Submit request'}
          </button>
          <Link to="/resident" className="text-sm text-[#b5cbcb] hover:text-white">My requests</Link>
        </div>
      </form>
    </section>
  );
}