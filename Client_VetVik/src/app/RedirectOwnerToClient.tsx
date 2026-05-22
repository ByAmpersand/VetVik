import { Navigate } from 'react-router';

export function RedirectOwnerToClient() {
  return <Navigate to="/client" replace />;
}
