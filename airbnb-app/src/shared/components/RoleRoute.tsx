import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';

type Role = 'HOST' | 'GUEST' | 'ADMIN';

/**
 * Protects a route by role.
 * If the user is authenticated but has the wrong role,
 * redirects them to their own dashboard instead of /.
 */
export function RoleRoute({ children, allow }: { children: ReactNode; allow: Role[] }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allow.includes(role as Role)) {
    // Send each role to their own dashboard
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard"  replace />;
    if (role === 'HOST')  return <Navigate to="/host/dashboard"   replace />;
    return                       <Navigate to="/guest/dashboard"  replace />;
  }

  return <>{children}</>;
}
