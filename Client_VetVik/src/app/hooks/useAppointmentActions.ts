import { useCallback, useState } from 'react';
import { appointmentsApi } from '../../api/endpoints';

export function useAppointmentActions(onDone?: () => void) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const cancel = useCallback(async (id: string, reason?: string) => {
    setBusyId(id);
    try {
      await appointmentsApi.cancel(id, reason);
      onDone?.();
    } finally {
      setBusyId(null);
    }
  }, [onDone]);

  const complete = useCallback(async (id: string) => {
    setBusyId(id);
    try {
      await appointmentsApi.complete(id);
      onDone?.();
    } finally {
      setBusyId(null);
    }
  }, [onDone]);

  return { busyId, cancel, complete };
}
