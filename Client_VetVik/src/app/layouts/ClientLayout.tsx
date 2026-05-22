import { VetVikShell } from '../components/redesign/VetVikShell';
import { RequireAuth } from '../auth/RequireAuth';

export function ClientLayout() {
  return (
    <RequireAuth allowedRoles={['client']}>
      <VetVikShell />
    </RequireAuth>
  );
}
