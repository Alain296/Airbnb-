import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

/**
 * Redirects to the correct dashboard based on the user's role.
 * Used at /dashboard so each role lands on their own page.
 */
export function RoleRedirect() {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === 'ADMIN') return <Navigate to="/admin/dashboard"  replace />;
  if (role === 'HOST')  return <Navigate to="/host/dashboard"   replace />;
  // GUEST → go to listings first, not dashboard
  return                       <Navigate to="/listings"         replace />;
}
