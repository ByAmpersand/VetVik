import { http } from "./http";
import { authStorage } from "./authStorage";
import type {
  AnimalSpeciesResponse,
  AppointmentResponse,
  AuthResponse,
  BreedResponse,
  ClinicSettingsResponse,
  ClinicWorkingHourResponse,
  CreateAppointmentRequest,
  CurrentUserResponse,
  DoctorResponse,
  DoctorWorkingHourResponse,
  LoginRequest,
  MedicalRecordResponse,
  PetResponse,
  RegisterOwnerRequest,
  RoomResponse,
  ServiceCategoryResponse,
  ServiceResponse,
  SpecializationResponse,
} from "./types";

export const authApi = {
  async login(req: LoginRequest): Promise<AuthResponse> {
    const auth = await http.post<AuthResponse>("/api/auth/login", req, { anonymous: true });
    authStorage.set(auth);
    return auth;
  },
  async registerOwner(req: RegisterOwnerRequest): Promise<AuthResponse> {
    const auth = await http.post<AuthResponse>("/api/auth/register/owner", req, { anonymous: true });
    authStorage.set(auth);
    return auth;
  },
  me: () => http.get<CurrentUserResponse>("/api/auth/me"),
  logout: () => authStorage.clear(),
};

export const clinicApi = {
  getSettings: () => http.get<ClinicSettingsResponse>("/api/clinic/settings"),
  updateSettings: (body: Omit<ClinicSettingsResponse, "id" | "updatedAt" | "workingHours">) =>
    http.put<ClinicSettingsResponse>("/api/clinic/settings", body),
  getWorkingHours: () => http.get<ClinicWorkingHourResponse[]>("/api/clinic/working-hours"),
  replaceWorkingHours: (body: Omit<ClinicWorkingHourResponse, "id">[]) =>
    http.put<ClinicWorkingHourResponse[]>("/api/clinic/working-hours", body),
};

export const roomsApi = {
  list: (includeInactive = false) =>
    http.get<RoomResponse[]>("/api/rooms", { query: { includeInactive } }),
  get: (id: string) => http.get<RoomResponse>(`/api/rooms/${id}`),
  create: (body: Omit<RoomResponse, "id">) => http.post<RoomResponse>("/api/rooms", body),
  update: (id: string, body: Omit<RoomResponse, "id">) => http.put<RoomResponse>(`/api/rooms/${id}`, body),
  remove: (id: string) => http.delete(`/api/rooms/${id}`),
};

export const petsApi = {
  listMine: () => http.get<PetResponse[]>("/api/pets/mine"),
  listAll: () => http.get<PetResponse[]>("/api/pets"),
  listByOwner: (ownerId: string) => http.get<PetResponse[]>(`/api/pets/by-owner/${ownerId}`),
  get: (id: string) => http.get<PetResponse>(`/api/pets/${id}`),
  createMine: (body: Omit<PetResponse, "id" | "ownerFullName" | "speciesName" | "breedName" | "createdAt" | "updatedAt" | "ownerId">) =>
    http.post<PetResponse>("/api/pets/mine", { ...body, ownerId: "00000000-0000-0000-0000-000000000000" }),
  update: (id: string, body: Partial<PetResponse>) => http.put<PetResponse>(`/api/pets/${id}`, body),
  remove: (id: string) => http.delete(`/api/pets/${id}`),
};

export const speciesApi = {
  list: (includeInactive = false) =>
    http.get<AnimalSpeciesResponse[]>("/api/species", { query: { includeInactive } }),
};

export const breedsApi = {
  list: (speciesId?: string, includeInactive = false) =>
    http.get<BreedResponse[]>("/api/breeds", { query: { speciesId, includeInactive } }),
};

export const doctorsApi = {
  list: (includeInactive = false, specializationId?: string) =>
    http.get<DoctorResponse[]>("/api/doctors", { query: { includeInactive, specializationId } }),
  get: (id: string) => http.get<DoctorResponse>(`/api/doctors/${id}`),
  workingHours: (id: string) => http.get<DoctorWorkingHourResponse[]>(`/api/doctors/${id}/working-hours`),
};

export const specializationsApi = {
  list: (includeInactive = false) =>
    http.get<SpecializationResponse[]>("/api/specializations", { query: { includeInactive } }),
};

export const serviceCategoriesApi = {
  list: (includeInactive = false) =>
    http.get<ServiceCategoryResponse[]>("/api/service-categories", { query: { includeInactive } }),
};

export const servicesApi = {
  list: (categoryId?: string, includeInactive = false) =>
    http.get<ServiceResponse[]>("/api/services", { query: { categoryId, includeInactive } }),
};

export const appointmentsApi = {
  get: (id: string) => http.get<AppointmentResponse>(`/api/appointments/${id}`),
  mineOwner: () => http.get<AppointmentResponse[]>("/api/appointments/mine"),
  mineDoctor: () => http.get<AppointmentResponse[]>("/api/appointments/doctor/mine"),
  byOwner: (ownerId: string) => http.get<AppointmentResponse[]>(`/api/appointments/by-owner/${ownerId}`),
  byDoctor: (doctorId: string) => http.get<AppointmentResponse[]>(`/api/appointments/by-doctor/${doctorId}`),
  calendar: (from: string, to: string) =>
    http.get<AppointmentResponse[]>("/api/appointments/calendar", { query: { from, to } }),
  range: (from: string, to: string, doctorId?: string, roomId?: string) =>
    http.get<AppointmentResponse[]>("/api/appointments/range", { query: { from, to, doctorId, roomId } }),
  create: (body: CreateAppointmentRequest) => http.post<AppointmentResponse>("/api/appointments", body),
  cancel: (id: string, reason?: string) =>
    http.post<AppointmentResponse>(`/api/appointments/${id}/cancel`, { reason }),
  complete: (id: string) => http.post<AppointmentResponse>(`/api/appointments/${id}/complete`),
};

export const medicalRecordsApi = {
  get: (id: string) => http.get<MedicalRecordResponse>(`/api/medical-records/${id}`),
  byAppointment: (id: string) => http.get<MedicalRecordResponse>(`/api/medical-records/by-appointment/${id}`),
  byPet: (petId: string) => http.get<MedicalRecordResponse[]>(`/api/medical-records/by-pet/${petId}`),
};
