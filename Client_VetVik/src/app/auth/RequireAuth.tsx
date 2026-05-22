import { Navigate, useLocation } from 'react-router';
import { canAccessPath, roleHomePath, type AppRole } from './roles';
import { useAuth } from './AuthContext';

export function RequireAuth({
  allowedRoles,
  children,
}: {
  allowedRoles: AppRole[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  if (!canAccessPath(user.role, location.pathname)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return <>{children}</>;
}
