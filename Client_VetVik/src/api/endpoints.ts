import { http } from "./http";
import { authStorage } from "./authStorage";
import type {
  AdminInsightsResponse,
  AnimalSpeciesResponse,
  AppointmentResponse,
  AvailableAppointmentSlotResponse,
  AuthResponse,
  BreedResponse,
  ChangePasswordRequest,
  ClientDirectoryResponse,
  ClinicSettingsResponse,
  ClinicWorkingHourResponse,
  CreateDoctorRequest,
  CreateAdminRequest,
  CreateAppointmentRequest,
  CreateDoctorStaffRequest,
  CreateMedicalRecordRequest,
  CurrentUserResponse,
  DoctorResponse,
  DoctorWorkingHourResponse,
  FindAvailableAppointmentSlotsRequest,
  InboxNotificationsSummaryResponse,
  LoginRequest,
  MedicalRecordResponse,
  NotificationPreferencesResponse,
  PetResponse,
  RegisterOwnerRequest,
  RoomResponse,
  ServiceCategoryResponse,
  ServiceResponse,
  SpecializationResponse,
  StaffMemberResponse,
  UpdateAppointmentRequest,
  UpdateClinicSettingsRequest,
  UpdateCurrentUserProfileRequest,
  UpdateDoctorRequest,
  UpdateMedicalRecordRequest,
  UpsertAnimalSpeciesRequest,
  UpsertBreedRequest,
  UpsertClinicWorkingHourRequest,
  UpsertDoctorWorkingHourRequest,
  UpsertPetRequest,
  UpsertRoomRequest,
  UpsertServiceCategoryRequest,
  UpsertServiceRequest,
  UpsertSpecializationRequest,
  UpsertVaccinationRequest,
  VaccinationResponse,
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
  updateProfile: (body: UpdateCurrentUserProfileRequest) =>
    http.put<CurrentUserResponse>("/api/auth/me/profile", body),
  changePassword: (body: ChangePasswordRequest) =>
    http.put<void>("/api/auth/me/password", body),
  notificationPreferences: () =>
    http.get<NotificationPreferencesResponse>("/api/auth/me/notification-preferences"),
  updateNotificationPreferences: (body: NotificationPreferencesResponse) =>
    http.put<NotificationPreferencesResponse>("/api/auth/me/notification-preferences", body),
  logout: () => authStorage.clear(),
};

export const clinicApi = {
  getSettings: () => http.get<ClinicSettingsResponse>("/api/clinic/settings"),
  updateSettings: (body: UpdateClinicSettingsRequest) =>
    http.put<ClinicSettingsResponse>("/api/clinic/settings", body),
  getWorkingHours: () => http.get<ClinicWorkingHourResponse[]>("/api/clinic/working-hours"),
  replaceWorkingHours: (body: UpsertClinicWorkingHourRequest[]) =>
    http.put<ClinicWorkingHourResponse[]>("/api/clinic/working-hours", body),
};

export const roomsApi = {
  list: (includeInactive = false) =>
    http.get<RoomResponse[]>("/api/rooms", { query: { includeInactive } }),
  get: (id: string) => http.get<RoomResponse>(`/api/rooms/${id}`),
  create: (body: UpsertRoomRequest) => http.post<RoomResponse>("/api/rooms", body),
  update: (id: string, body: UpsertRoomRequest) => http.put<RoomResponse>(`/api/rooms/${id}`, body),
  remove: (id: string) => http.delete(`/api/rooms/${id}`),
};

export const petsApi = {
  listMine: () => http.get<PetResponse[]>("/api/pets/mine"),
  listAll: () => http.get<PetResponse[]>("/api/pets"),
  listByOwner: (ownerId: string) => http.get<PetResponse[]>(`/api/pets/by-owner/${ownerId}`),
  get: (id: string) => http.get<PetResponse>(`/api/pets/${id}`),
  createMine: (body: UpsertPetRequest) =>
    http.post<PetResponse>("/api/pets/mine", body),
  update: (id: string, body: UpsertPetRequest) => http.put<PetResponse>(`/api/pets/${id}`, body),
  remove: (id: string) => http.delete(`/api/pets/${id}`),
};

export const speciesApi = {
  list: (includeInactive = false) =>
    http.get<AnimalSpeciesResponse[]>("/api/species", { query: { includeInactive } }),
  get: (id: string) => http.get<AnimalSpeciesResponse>(`/api/species/${id}`),
  create: (body: UpsertAnimalSpeciesRequest) => http.post<AnimalSpeciesResponse>("/api/species", body),
  update: (id: string, body: UpsertAnimalSpeciesRequest) =>
    http.put<AnimalSpeciesResponse>(`/api/species/${id}`, body),
  remove: (id: string) => http.delete(`/api/species/${id}`),
};

export const breedsApi = {
  list: (speciesId?: string, includeInactive = false) =>
    http.get<BreedResponse[]>("/api/breeds", { query: { speciesId, includeInactive } }),
  get: (id: string) => http.get<BreedResponse>(`/api/breeds/${id}`),
  create: (body: UpsertBreedRequest) => http.post<BreedResponse>("/api/breeds", body),
  update: (id: string, body: UpsertBreedRequest) => http.put<BreedResponse>(`/api/breeds/${id}`, body),
  remove: (id: string) => http.delete(`/api/breeds/${id}`),
};

export const doctorsApi = {
  list: (includeInactive = false, specializationId?: string) =>
    http.get<DoctorResponse[]>("/api/doctors", { query: { includeInactive, specializationId } }),
  get: (id: string) => http.get<DoctorResponse>(`/api/doctors/${id}`),
  create: (body: CreateDoctorRequest) => http.post<DoctorResponse>("/api/doctors", body),
  update: (id: string, body: UpdateDoctorRequest) => http.put<DoctorResponse>(`/api/doctors/${id}`, body),
  remove: (id: string) => http.delete(`/api/doctors/${id}`),
  workingHours: (id: string) => http.get<DoctorWorkingHourResponse[]>(`/api/doctors/${id}/working-hours`),
  replaceWorkingHours: (id: string, body: UpsertDoctorWorkingHourRequest[]) =>
    http.put<DoctorWorkingHourResponse[]>(`/api/doctors/${id}/working-hours`, body),
  assignSpecialization: (id: string, specializationId: string) =>
    http.post<DoctorResponse>(`/api/doctors/${id}/specializations/${specializationId}`),
  removeSpecialization: (id: string, specializationId: string) =>
    http.delete<DoctorResponse>(`/api/doctors/${id}/specializations/${specializationId}`),
};

export const specializationsApi = {
  list: (includeInactive = false) =>
    http.get<SpecializationResponse[]>("/api/specializations", { query: { includeInactive } }),
  get: (id: string) => http.get<SpecializationResponse>(`/api/specializations/${id}`),
  create: (body: UpsertSpecializationRequest) =>
    http.post<SpecializationResponse>("/api/specializations", body),
  update: (id: string, body: UpsertSpecializationRequest) =>
    http.put<SpecializationResponse>(`/api/specializations/${id}`, body),
  remove: (id: string) => http.delete(`/api/specializations/${id}`),
};

export const serviceCategoriesApi = {
  list: (includeInactive = false) =>
    http.get<ServiceCategoryResponse[]>("/api/service-categories", { query: { includeInactive } }),
  get: (id: string) => http.get<ServiceCategoryResponse>(`/api/service-categories/${id}`),
  create: (body: UpsertServiceCategoryRequest) =>
    http.post<ServiceCategoryResponse>("/api/service-categories", body),
  update: (id: string, body: UpsertServiceCategoryRequest) =>
    http.put<ServiceCategoryResponse>(`/api/service-categories/${id}`, body),
  remove: (id: string) => http.delete(`/api/service-categories/${id}`),
};

export const servicesApi = {
  list: (categoryId?: string, includeInactive = false) =>
    http.get<ServiceResponse[]>("/api/services", { query: { categoryId, includeInactive } }),
  get: (id: string) => http.get<ServiceResponse>(`/api/services/${id}`),
  create: (body: UpsertServiceRequest) => http.post<ServiceResponse>("/api/services", body),
  update: (id: string, body: UpsertServiceRequest) => http.put<ServiceResponse>(`/api/services/${id}`, body),
  remove: (id: string) => http.delete(`/api/services/${id}`),
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
  availableSlots: (body: FindAvailableAppointmentSlotsRequest) =>
    http.post<AvailableAppointmentSlotResponse[]>("/api/appointments/available-slots", body),
  create: (body: CreateAppointmentRequest) => http.post<AppointmentResponse>("/api/appointments", body),
  update: (id: string, body: UpdateAppointmentRequest) =>
    http.put<AppointmentResponse>(`/api/appointments/${id}`, body),
  cancel: (id: string, reason?: string) =>
    http.post<AppointmentResponse>(`/api/appointments/${id}/cancel`, { reason }),
  confirm: (id: string) => http.post<AppointmentResponse>(`/api/appointments/${id}/confirm`),
  reject: (id: string, reason?: string) =>
    http.post<AppointmentResponse>(`/api/appointments/${id}/reject`, { reason }),
  complete: (id: string) => http.post<AppointmentResponse>(`/api/appointments/${id}/complete`),
};

export const medicalRecordsApi = {
  get: (id: string) => http.get<MedicalRecordResponse>(`/api/medical-records/${id}`),
  byAppointment: (id: string) => http.get<MedicalRecordResponse>(`/api/medical-records/by-appointment/${id}`),
  byPet: (petId: string) => http.get<MedicalRecordResponse[]>(`/api/medical-records/by-pet/${petId}`),
  create: (body: CreateMedicalRecordRequest) => http.post<MedicalRecordResponse>("/api/medical-records", body),
  update: (id: string, body: UpdateMedicalRecordRequest) =>
    http.put<MedicalRecordResponse>(`/api/medical-records/${id}`, body),
};

export const vaccinationsApi = {
  mine: () => http.get<VaccinationResponse[]>("/api/vaccinations/mine"),
  byPet: (petId: string) => http.get<VaccinationResponse[]>(`/api/vaccinations/by-pet/${petId}`),
  create: (body: UpsertVaccinationRequest) => http.post<VaccinationResponse>("/api/vaccinations", body),
  update: (id: string, body: UpsertVaccinationRequest) =>
    http.put<VaccinationResponse>(`/api/vaccinations/${id}`, body),
  remove: (id: string) => http.delete(`/api/vaccinations/${id}`),
};

export const staffApi = {
  list: () => http.get<StaffMemberResponse[]>("/api/staff"),
  createAdmin: (body: CreateAdminRequest) => http.post<StaffMemberResponse>("/api/staff/admins", body),
  createDoctor: (body: CreateDoctorStaffRequest) => http.post<StaffMemberResponse>("/api/staff/doctors", body),
  remove: (userId: string) => http.delete(`/api/staff/${userId}`),
};

export const clientsApi = {
  list: () => http.get<ClientDirectoryResponse[]>("/api/clients"),
};

export const analyticsApi = {
  adminInsights: () => http.get<AdminInsightsResponse>("/api/analytics/admin-insights"),
};

export const notificationsApi = {
  inbox: (limit = 20) =>
    http.get<InboxNotificationsSummaryResponse>(`/api/notifications?limit=${limit}`),
  markRead: (id: string) => http.post<void>(`/api/notifications/${id}/read`),
  markAllRead: () => http.post<void>("/api/notifications/read-all"),
};
