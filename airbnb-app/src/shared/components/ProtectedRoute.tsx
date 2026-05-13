import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiLock } from 'react-icons/fi';
import { useAuth } from '../../features/auth/hooks/useAuth';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to access this page', {
        icon: <FiLock size={16} />,
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
