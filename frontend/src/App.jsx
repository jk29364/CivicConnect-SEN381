import { BrowserRouter, Routes, Route, Navigate, NavLink, Link, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import MyRequests from './pages/resident/MyRequests';
import NewRequest from './pages/NewRequest';
import StaffDashboard from './pages/staff/StaffDashboard';
import RequestList from './pages/RequestList';
import RequestDetail from './pages/RequestDetail';

const navClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-[#fe571e] text-white' : 'text-[#b5cbcb] hover:text-white'}`;

function Shell() {
  const { pathname } = useLocation();
  const area = pathname.startsWith('/resident') ? 'resident' : pathname.startsWith('/staff') ? 'staff' : null;
  const links = area === 'resident'
    ? [['/resident', 'My requests'], ['/resident/new', 'Submit request']]
    : area === 'staff'
      ? [['/staff', 'Dashboard'], ['/staff/queue', 'Queue']]
      : [];

  return (
    <div className="min-h-screen bg-[#1A0E1C] text-[#f2dcf1]">
      <header className="flex items-center justify-between border-b border-[#3e3040] px-6 py-4">
        <Link to="/" className="text-lg font-semibold">CivicConnect</Link>
        {area && (
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-wider text-[#b5cbcb]">{area}</span>
            <nav className="flex gap-2">
              {links.map(([to, label]) => (
                <NavLink key={to} to={to} end className={navClass}>{label}</NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/resident" element={<MyRequests />} />
          <Route path="/resident/new" element={<NewRequest />} />
          <Route path="/resident/requests/:id" element={<RequestDetail area="resident" />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/queue" element={<RequestList />} />
          <Route path="/staff/requests/:id" element={<RequestDetail area="staff" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

export default App;