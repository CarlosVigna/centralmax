import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  requiredRole?: 'ADMIN';
}

export function PrivateRoute({ requiredRole }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
