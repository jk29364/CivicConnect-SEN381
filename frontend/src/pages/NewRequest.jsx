import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError, CATEGORIES, SEVERITIES } from '../api';

const EMPTY = {
  category: 'Maintenance', location: '', description: '', severity: 'Low',
  faultType: '', areaName: '', itemName: '', dateLastSeen: '', incidentTime: '', threatLevel: 'Low',
};

const field = 'w-full rounded-md border bg-[#160a18] px-3 py-2 text-sm text-[#f2dcf1]';
const label = 'flex flex-col gap-1 text-sm text-[#b5cbcb]';

// Maps server messages such as "faultType is required..." onto the input that caused them.
const FIELD_HINTS = ['faultType', 'areaName', 'itemName', 'dateLastSeen', 'incidentTime',
  'threatLevel', 'severity', 'location', 'description', 'category'];

function splitServerErrors(details) {
  const byField = {};
  const general = [];
  details.forEach((msg) => {
    const hit = FIELD_HINTS.find((name) => msg.includes(name));
    if (hit) byField[hit] = byField[hit] ? `${byField[hit]}. ${msg}` : msg;
    else general.push(msg);
  });
  return { byField, general };
}

function validate(form) {
  const errors = {};
  const today = new Date().toISOString().slice(0, 10);
  if (!form.location.trim()) errors.location = 'Enter where the problem is.';
  if (!form.description.trim()) errors.description = 'Describe the problem.';
  if (form.category === 'Maintenance' && !form.faultType.trim()) errors.faultType = 'Enter the fault type.';
  if (form.category === 'Common Area' && !form.areaName.trim()) errors.areaName = 'Enter the area name.';
  if (form.category === 'Lost Property') {
    if (!form.itemName.trim()) errors.itemName = 'Enter the item name.';
    if (!form.dateLastSeen) errors.dateLastSeen = 'Enter the date it was last seen.';
    else if (form.dateLastSeen > today) errors.dateLastSeen = 'The date cannot be in the future.';
  }
  if (form.category === 'Security') {
    if (!form.incidentTime) errors.incidentTime = 'Enter when the incident happened.';
    else if (new Date(form.incidentTime) > new Date()) errors.incidentTime = 'The incident time cannot be in the future.';
  }
  return errors;
}

function Field({ name, errors, children }) {
  return (
    <>
      {children}
      {errors[name] && <p className="text-sm text-[#ff8a80]">{errors[name]}</p>}
    </>
  );
}

export default function NewRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const inputClass = (key) => `${field} ${errors[key] ? 'border-[#ff8a80]' : 'border-[#3e3040]'}`;

  async function submit(e) {
    e.preventDefault();
    setGeneralError(null);
    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    const payload = {
      category: form.category,
      location: form.location.trim(),
      description: form.description.trim(),
      severity: form.severity,
    };
    if (form.category === 'Maintenance') payload.faultType = form.faultType.trim();
    if (form.category === 'Common Area') payload.areaName = form.areaName.trim();
    if (form.category === 'Lost Property') {
      payload.itemName = form.itemName.trim();
      payload.dateLastSeen = form.dateLastSeen;
    }
    if (form.category === 'Security') {
      payload.incidentTime = new Date(form.incidentTime).toISOString();
      payload.threatLevel = form.threatLevel;
    }

    setSaving(true);
    try {
      const res = await api('/api/requests', { method: 'POST', body: payload });
      navigate(`/resident/requests/${res.request.id}`, { state: { reference: res.referenceNumber } });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const { byField, general } = splitServerErrors(err.details.length ? err.details : [err.message]);
        setErrors(byField);
        if (general.length) setGeneralError(general.join('. '));
      } else {
        setGeneralError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-xl">
      <h1 className="text-2xl font-semibold">Submit a service request</h1>
      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
        <label className={label}>Category
          <select className={inputClass('category')} value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>

        <Field name="location" errors={errors}>
          <label className={label}>Location
            <input className={inputClass('location')} value={form.location} onChange={set('location')} />
          </label>
        </Field>

        <Field name="description" errors={errors}>
          <label className={label}>Description
            <textarea className={inputClass('description')} rows={4} value={form.description} onChange={set('description')} />
          </label>
        </Field>

        <label className={label}>Severity
          <select className={inputClass('severity')} value={form.severity} onChange={set('severity')}>
            {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>

        {form.category === 'Maintenance' && (
          <Field name="faultType" errors={errors}>
            <label className={label}>Fault type
              <input className={inputClass('faultType')} value={form.faultType} onChange={set('faultType')} />
            </label>
          </Field>
        )}
        {form.category === 'Common Area' && (
          <Field name="areaName" errors={errors}>
            <label className={label}>Area name
              <input className={inputClass('areaName')} value={form.areaName} onChange={set('areaName')} />
            </label>
          </Field>
        )}
        {form.category === 'Lost Property' && (
          <>
            <Field name="itemName" errors={errors}>
              <label className={label}>Item name
                <input className={inputClass('itemName')} value={form.itemName} onChange={set('itemName')} />
              </label>
            </Field>
            <Field name="dateLastSeen" errors={errors}>
              <label className={label}>Date last seen
                <input type="date" className={inputClass('dateLastSeen')} value={form.dateLastSeen} onChange={set('dateLastSeen')} />
              </label>
            </Field>
          </>
        )}
        {form.category === 'Security' && (
          <>
            <Field name="incidentTime" errors={errors}>
              <label className={label}>Incident time
                <input type="datetime-local" className={inputClass('incidentTime')} value={form.incidentTime} onChange={set('incidentTime')} />
              </label>
            </Field>
            <label className={label}>Threat level
              <select className={inputClass('threatLevel')} value={form.threatLevel} onChange={set('threatLevel')}>
                {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </>
        )}

        {generalError && (
          <p role="alert" className="rounded-md border border-[#ff8a80] px-3 py-2 text-sm text-[#ff8a80]">{generalError}</p>
        )}

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