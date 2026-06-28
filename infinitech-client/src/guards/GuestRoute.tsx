import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

function dashboardFor(role?: string) {
  if (role === 'Admin') return '/admin/dashboard';
  if (role === 'Master') return '/master/dashboard';
  return '/client/dashboard';
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  if (isAuthenticated) return <Navigate to={dashboardFor(user?.role)} replace />;
  return <>{children}</>;
}
