import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import type { UserRole } from '../types';

function dashboardFor(role: UserRole) {
  if (role === 'Admin') return '/admin/dashboard';
  if (role === 'Master') return '/master/dashboard';
  return '/client/dashboard';
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(user.role)) {
      return <Navigate to={dashboardFor(user.role)} replace />;
    }
  }

  return <>{children}</>;
}
