import { VetVikShell } from '../components/redesign/VetVikShell';
import { RequireAuth } from '../auth/RequireAuth';

export function DoctorLayout() {
  return (
    <RequireAuth allowedRoles={['doctor']}>
      <VetVikShell />
    </RequireAuth>
  );
}
