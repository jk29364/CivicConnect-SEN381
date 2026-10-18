import { Link } from 'react-router-dom';

const card = 'rounded-lg border border-[#3e3040] p-6 hover:bg-[#2a1830]';

export default function Landing() {
  return (
    <section className="mx-auto max-w-3xl pt-10">
      <h1 className="text-3xl font-semibold">Service requests</h1>
      <p className="mt-2 text-[#b5cbcb]">Choose how you are using the system.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/resident" className={card}>
          <h2 className="text-lg font-semibold">Resident</h2>
          <p className="mt-2 text-sm text-[#b5cbcb]">Submit a request and follow its status and history.</p>
        </Link>
        <Link to="/staff" className={card}>
          <h2 className="text-lg font-semibold">Staff</h2>
          <p className="mt-2 text-sm text-[#b5cbcb]">See the dashboard, work the queue and update request status.</p>
        </Link>
      </div>
    </section>
  );
}