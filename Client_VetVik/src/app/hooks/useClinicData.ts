import { useCallback, useEffect, useRef, useState } from 'react';
import {
  analyticsApi,
  appointmentsApi,
  authApi,
  breedsApi,
  clientsApi,
  clinicApi,
  doctorsApi,
  medicalRecordsApi,
  petsApi,
  roomsApi,
  servicesApi,
  specializationsApi,
  speciesApi,
  staffApi,
  vaccinationsApi,
} from '../../api/endpoints';
import type {
  AdminInsightsResponse,
  AnimalSpeciesResponse,
  AppointmentResponse,
  BreedResponse,
  ClientDirectoryResponse,
  ClinicSettingsResponse,
  DoctorResponse,
  DoctorWorkingHourResponse,
  MedicalRecordResponse,
  PetResponse,
  RoomResponse,
  ServiceResponse,
  SpecializationResponse,
  StaffMemberResponse,
  VaccinationResponse,
} from '../../api/types';
import { useAuth } from '../auth/AuthContext';

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

function useAsync<T>(loader: () => Promise<T>, initial: T, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    loader()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function useCurrentUserProfile() {
  return useAsync(
    () => authApi.me(),
    { userId: '', email: '', roles: [] as string[], profileId: null, firstName: null, lastName: null },
    [],
  );
}

export function useOwnerPets() {
  return useAsync<PetResponse[]>(() => petsApi.listMine(), []);
}

export function useOwnerAppointments() {
  return useAsync<AppointmentResponse[]>(() => appointmentsApi.mineOwner(), []);
}

export function useOwnerVaccinations() {
  return useAsync<VaccinationResponse[]>(() => vaccinationsApi.mine(), []);
}

export function useOwnerMedicalRecords(petIds: string[]) {
  return useAsync<MedicalRecordResponse[]>(async () => {
    if (!petIds.length) return [];
    const batches = await Promise.all(petIds.map((id) => medicalRecordsApi.byPet(id)));
    return batches.flat().sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate));
  }, [], [petIds.join(',')]);
}

export function useDoctorAppointments() {
  return useAsync<AppointmentResponse[]>(() => appointmentsApi.mineDoctor(), []);
}

export function useAdminAppointments(from?: string, to?: string) {
  const defaultFrom = useRef(from ?? new Date(Date.now() - 30 * 86400000).toISOString());
  const defaultTo = useRef(to ?? new Date(Date.now() + 30 * 86400000).toISOString());
  const rangeFrom = from ?? defaultFrom.current;
  const rangeTo = to ?? defaultTo.current;
  return useAsync<AppointmentResponse[]>(
    () => appointmentsApi.calendar(rangeFrom, rangeTo),
    [],
    [rangeFrom, rangeTo],
  );
}

export function useDoctors(includeInactive = false) {
  return useAsync<DoctorResponse[]>(() => doctorsApi.list(includeInactive), [], [includeInactive]);
}

export function useDoctorWorkingHours(doctorId?: string) {
  return useAsync<DoctorWorkingHourResponse[]>(
    () => (doctorId ? doctorsApi.workingHours(doctorId) : Promise.resolve([])),
    [],
    [doctorId],
  );
}

export function useServices() {
  return useAsync<ServiceResponse[]>(() => servicesApi.list(undefined, false), []);
}

export function useRooms() {
  return useAsync<RoomResponse[]>(() => roomsApi.list(false), []);
}

export function useSpecies(includeInactive = false) {
  return useAsync<AnimalSpeciesResponse[]>(
    () => speciesApi.list(includeInactive),
    [],
    [includeInactive],
  );
}

export function useBreeds(speciesId?: string, includeInactive = false) {
  return useAsync<BreedResponse[]>(
    () => (speciesId ? breedsApi.list(speciesId, includeInactive) : Promise.resolve([])),
    [],
    [speciesId, includeInactive],
  );
}

export function useSpecializations(includeInactive = false) {
  return useAsync<SpecializationResponse[]>(
    () => specializationsApi.list(includeInactive),
    [],
    [includeInactive],
  );
}

export function useAllPets() {
  return useAsync<PetResponse[]>(() => petsApi.listAll(), []);
}

export function useClinicSettings() {
  return useAsync<ClinicSettingsResponse>(() => clinicApi.getSettings(), {
    id: '',
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    description: null,
    updatedAt: null,
    workingHours: [],
  });
}

export function useStaffMembers() {
  const { user } = useAuth();
  return useAsync<StaffMemberResponse[]>(
    () => staffApi.list(),
    [],
    [user?.role],
  );
}

export function useClientsDirectory() {
  return useAsync<ClientDirectoryResponse[]>(() => clientsApi.list(), []);
}

export function useAdminInsights() {
  return useAsync<AdminInsightsResponse>(() => analyticsApi.adminInsights(), {
    monthlyVisits: 0,
    completedVisits: 0,
    cancelledVisits: 0,
    activeDoctors: 0,
    monthlyTrend: [],
    weeklyWorkload: [],
    serviceDistribution: [],
    speciesDistribution: [],
  });
}

export function usePetVaccinations(petId?: string) {
  return useAsync<VaccinationResponse[]>(
    () => (petId ? vaccinationsApi.byPet(petId) : Promise.resolve([])),
    [],
    [petId],
  );
}

export function usePetMedicalRecords(petId?: string) {
  return useAsync<MedicalRecordResponse[]>(
    () => (petId ? medicalRecordsApi.byPet(petId) : Promise.resolve([])),
    [],
    [petId],
  );
}

export function useMedicalRecordByAppointment(appointmentId?: string) {
  return useAsync<MedicalRecordResponse | null>(
    async () => {
      if (!appointmentId) return null;
      try {
        return await medicalRecordsApi.byAppointment(appointmentId);
      } catch {
        return null;
      }
    },
    null,
    [appointmentId],
  );
}

export function usePetById(petId?: string, ownerPets: PetResponse[] = []) {
  const fromList = ownerPets.find((p) => p.id === petId);
  const loadPet = () => {
    if (fromList) return Promise.resolve(fromList);
    if (petId) return petsApi.get(petId);
    return Promise.resolve(null);
  };
  return useAsync<PetResponse | null>(
    loadPet,
    null,
    [petId, fromList?.id],
  );
}
