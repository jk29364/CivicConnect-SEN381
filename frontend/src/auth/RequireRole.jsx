import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export default function RequireRole({ allow, children }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (!allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}