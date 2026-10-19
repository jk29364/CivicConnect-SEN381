import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { homeFor } from '../auth/home';
import { ApiError } from '../api';

const input = 'w-full rounded-lg border border-[#3e3040] bg-[#160a18] px-4 py-3 text-sm text-[#f2dcf1] placeholder:text-[#b5cbcb]/50 focus:border-[#fe571e] focus:outline-none';

export default function SignIn() {
  const { signIn, isAuthenticated, role } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to={homeFor(role)} replace />;

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError({ text: 'Enter your email and password.' });
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Deliberately vague: we do not reveal whether the email exists.
        setError({ text: 'Incorrect email or password.', offerRegister: true });
      } else {
        setError({ text: err.message });
      }
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md pt-12">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-[#b5cbcb]">Residents and estate staff use the same page.</p>

      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-[#b5cbcb]">Email
          <input type="email" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-[#b5cbcb]">Password
          <input type="password" autoComplete="current-password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error && (
          <div role="alert" className="rounded-lg border border-[#ff8a80]/40 px-4 py-3 text-sm text-[#ff8a80]">
            <p>{error.text}</p>
            {error.offerRegister && (
              <p className="mt-2 text-[#b5cbcb]">
                No account yet? <Link to="/register" className="text-[#fe571e] hover:underline">Create one</Link>
              </p>
            )}
          </div>
        )}

        <button type="submit" disabled={busy}
          className="rounded-lg bg-[#fe571e] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#fe571e]/20 disabled:opacity-50">
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[#b5cbcb]">
        New here? <Link to="/register" className="text-[#fe571e] hover:underline">Create an account</Link>
      </p>
    </section>
  );
}