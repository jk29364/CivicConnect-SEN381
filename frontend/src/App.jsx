import { BrowserRouter, Routes, Route, Navigate, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import AuthProvider from './auth/AuthContext';
import RequireRole from './auth/RequireRole';
import { useAuth } from './auth/useAuth';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import MyRequests from './pages/resident/MyRequests';
import NewRequest from './pages/NewRequest';
import StaffDashboard from './pages/staff/StaffDashboard';
import RequestList from './pages/RequestList';
import RequestDetail from './pages/RequestDetail';

const STAFF = ['Staff', 'Agent'];
const navClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm transition ${isActive ? 'bg-[#fe571e] text-white' : 'text-[#b5cbcb] hover:text-white'}`;

function Shell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role, logout } = useAuth();

  const area = pathname.startsWith('/resident') ? 'resident' : pathname.startsWith('/staff') ? 'staff' : null;
  const links = area === 'resident'
    ? [['/resident', 'My requests'], ['/resident/new', 'New request']]
    : area === 'staff'
      ? [['/staff', 'Dashboard'], ['/staff/queue', 'Queue']]
      : [];

  function signOut() {
    logout();
    navigate('/signin', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#1A0E1C] text-[#f2dcf1]">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#3e3040] bg-[#1A0E1C]/90 px-6 py-4 backdrop-blur">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#fe571e] text-xs font-bold text-white">CC</span>
          CivicConnect
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          {area && <span className="text-xs uppercase tracking-wider text-[#b5cbcb]">{area}</span>}
          <nav className="flex gap-1">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end className={navClass}>{label}</NavLink>
            ))}
          </nav>
          {isAuthenticated ? (
            <button type="button" onClick={signOut} className="text-sm text-[#b5cbcb] hover:text-white">
              Sign out ({role})
            </button>
          ) : (
            <div className="flex items-center gap-4 text-sm">
              <Link to="/signin" className="text-[#b5cbcb] hover:text-white">Sign in</Link>
              <Link to="/register" className="text-[#fe571e] hover:underline">Create account</Link>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resident" element={<RequireRole allow={['Resident']}><MyRequests /></RequireRole>} />
          <Route path="/resident/new" element={<RequireRole allow={['Resident']}><NewRequest /></RequireRole>} />
          <Route path="/resident/requests/:id" element={<RequireRole allow={['Resident']}><RequestDetail area="resident" /></RequireRole>} />
          <Route path="/staff" element={<RequireRole allow={STAFF}><StaffDashboard /></RequireRole>} />
          <Route path="/staff/queue" element={<RequireRole allow={STAFF}><RequestList /></RequireRole>} />
          <Route path="/staff/requests/:id" element={<RequireRole allow={STAFF}><RequestDetail area="staff" /></RequireRole>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;