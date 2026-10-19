import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { homeFor } from '../auth/home';
import { ApiError } from '../api';

const input = 'w-full rounded-lg border border-[#3e3040] bg-[#160a18] px-4 py-3 text-sm text-[#f2dcf1] placeholder:text-[#b5cbcb]/50 focus:border-[#fe571e] focus:outline-none';

const ROLES = [
  { value: 'Resident', help: 'You live on the estate and want to log and track service requests.' },
  { value: 'Staff', help: 'You work for the estate. Your account needs approval from the estate office first.' },
];

export default function Register() {
  const { register, isAuthenticated, role: currentRole } = useAuth();
  const [role, setRole] = useState('Resident');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [general, setGeneral] = useState(null);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to={homeFor(currentRole)} replace />;

  if (pendingMessage) {
    return (
      <section className="mx-auto max-w-md pt-12">
        <h1 className="text-3xl font-semibold tracking-tight">Request received</h1>
        <p className="mt-4 text-[#b5cbcb]">{pendingMessage}</p>
        <Link to="/signin" className="mt-6 inline-block text-sm text-[#fe571e] hover:underline">Back to sign in</Link>
      </section>
    );
  }

  function validate() {
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    if (confirm !== password) next.confirm = 'The passwords do not match.';
    return next;
  }

  async function submit(e) {
    e.preventDefault();
    setGeneral(null);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const result = await register(email.trim(), password, role);
      if (!result.signedIn) setPendingMessage(result.message);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ email: 'An account with this email already exists. Sign in instead.' });
      } else if (err instanceof ApiError && err.status === 400) {
        const byField = {};
        err.details.forEach((msg) => {
          if (msg.includes('email')) byField.email = msg;
          else if (msg.includes('password')) byField.password = msg;
          else if (msg.includes('role')) byField.role = msg;
        });
        setErrors(byField);
      } else {
        setGeneral(err.message);
      }
      setBusy(false);
    }
  }

  const fieldError = (key) => errors[key] && <p className="text-sm text-[#ff8a80]">{errors[key]}</p>;

  return (
    <section className="mx-auto max-w-md pt-12">
      <h1 className="text-3xl font-semibold tracking-tight">Create an account</h1>
      <p className="mt-2 text-sm text-[#b5cbcb]">Choose the option that describes you.</p>

      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm text-[#b5cbcb]">I am registering as</legend>
          {ROLES.map((option) => (
            <label key={option.value}
              className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${role === option.value ? 'border-[#fe571e] bg-[#fe571e]/10' : 'border-[#3e3040] hover:border-[#b5cbcb]/40'}`}>
              <input type="radio" name="role" value={option.value} checked={role === option.value}
                onChange={() => setRole(option.value)} className="mt-1 accent-[#fe571e]" />
              <span>
                <span className="block font-medium text-[#f2dcf1]">{option.value}</span>
                <span className="text-xs text-[#b5cbcb]">{option.help}</span>
              </span>
            </label>
          ))}
          {fieldError('role')}
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm text-[#b5cbcb]">Email
          <input type="email" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          {fieldError('email')}
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-[#b5cbcb]">Password
          <input type="password" autoComplete="new-password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
          {fieldError('password')}
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-[#b5cbcb]">Confirm password
          <input type="password" autoComplete="new-password" className={input} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {fieldError('confirm')}
        </label>

        {general && <p role="alert" className="rounded-lg border border-[#ff8a80]/40 px-3 py-2 text-sm text-[#ff8a80]">{general}</p>}

        <button type="submit" disabled={busy}
          className="rounded-lg bg-[#fe571e] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#fe571e]/20 disabled:opacity-50">
          {busy ? 'Creating account...' : role === 'Staff' ? 'Request staff access' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[#b5cbcb]">
        Already registered? <Link to="/signin" className="text-[#fe571e] hover:underline">Sign in</Link>
      </p>
    </section>
  );
}