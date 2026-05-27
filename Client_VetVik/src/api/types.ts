/**
 * Mirrors the C# DTOs in Server_VetVik. Keep in sync manually for now
 * (Swashbuckle JSON could power code-generation later).
 */

export type Role = "Admin" | "Doctor" | "Owner" | "SuperAdmin";

export type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "NoShow";

export type PetSex = "Unknown" | "Male" | "Female";

// --- Auth ---
export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  userId: string;
  email: string;
  roles: Role[];
}

export interface RegisterOwnerRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CurrentUserResponse {
  userId: string;
  email: string;
  roles: Role[];
  profileId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  notificationPreferences: NotificationPreferencesResponse;
}

export interface UpdateCurrentUserProfileRequest {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationPreferencesResponse {
  appointmentReminders: boolean;
  medicalRecordUpdates: boolean;
  clinicAnnouncements: boolean;
}

export interface InboxNotificationResponse {
  id: string;
  title: string;
  message: string;
  category: string;
  linkPath?: string | null;
  relatedEntityId?: string | null;
  isRead: boolean;
  createdAtUtc: string;
}

export interface InboxNotificationsSummaryResponse {
  items: InboxNotificationResponse[];
  unreadCount: number;
}

// --- Clinic ---
export type DayOfWeekValue =
  | number
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface ClinicSettingsResponse {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  description?: string | null;
  updatedAt?: string | null;
  workingHours: ClinicWorkingHourResponse[];
}

export interface ClinicWorkingHourResponse {
  id: string;
  dayOfWeek: DayOfWeekValue;
  openTime: string;
  closeTime: string;
  isWorkingDay: boolean;
}

export interface UpdateClinicSettingsRequest {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  description?: string | null;
}

export interface UpsertClinicWorkingHourRequest {
  dayOfWeek: DayOfWeekValue;
  openTime: string;
  closeTime: string;
  isWorkingDay: boolean;
}

export interface RoomResponse {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface UpsertRoomRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
}

// --- Pets ---
export interface AnimalSpeciesResponse {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface UpsertAnimalSpeciesRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface BreedResponse {
  id: string;
  speciesId: string;
  speciesName: string;
  name: string;
  isActive: boolean;
}

export interface UpsertBreedRequest {
  speciesId: string;
  name: string;
  isActive: boolean;
}

export interface PetResponse {
  id: string;
  ownerId: string;
  ownerFullName: string;
  speciesId: string;
  speciesName: string;
  breedId?: string | null;
  breedName?: string | null;
  name: string;
  sex: PetSex;
  birthDate?: string | null;
  weight?: number | null;
  photoUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

// --- Doctors / Specializations ---
export interface SpecializationResponse {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface UpsertSpecializationRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface DoctorResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  photoUrl?: string | null;
  experienceYears?: number | null;
  isActive: boolean;
  specializations: SpecializationResponse[];
}

export interface DoctorWorkingHourResponse {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeekValue;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface CreateDoctorRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  photoUrl?: string | null;
  experienceYears?: number | null;
  isActive: boolean;
  specializationIds?: string[] | null;
}

export interface UpdateDoctorRequest {
  firstName: string;
  lastName: string;
  bio?: string | null;
  photoUrl?: string | null;
  experienceYears?: number | null;
  isActive: boolean;
}

export interface UpsertDoctorWorkingHourRequest {
  dayOfWeek: DayOfWeekValue;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// --- Services ---
export interface ServiceCategoryResponse {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface UpsertServiceCategoryRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface ServiceResponse {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface UpsertServiceRequest {
  categoryId: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

// --- Appointments ---
export interface AppointmentResponse {
  id: string;
  ownerId: string;
  ownerFullName: string;
  petId: string;
  petName: string;
  petSpecies: string;
  doctorId: string;
  doctorFullName: string;
  roomId: string;
  roomName: string;
  serviceId: string;
  serviceName: string;
  serviceDurationMinutes: number;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  reason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
}

export interface CreateAppointmentRequest {
  petId: string;
  doctorId?: string | null;
  /** Assigned by the clinic when omitted during owner self-booking. */
  roomId?: string | null;
  serviceId: string;
  startAt: string;
  endAt?: string | null;
  reason?: string | null;
  notes?: string | null;
  ownerId?: string | null;
}

export interface FindAvailableAppointmentSlotsRequest {
  serviceId: string;
  from: string;
  to: string;
  doctorId?: string | null;
  roomId?: string | null;
  stepMinutes?: number;
  maxSlots?: number;
}

export interface AvailableAppointmentSlotResponse {
  startAt: string;
  endAt: string;
  doctorId: string;
  doctorFullName: string;
  roomId: string;
  roomName: string;
  isAutoAssignedDoctor: boolean;
}

export interface UpdateAppointmentRequest {
  petId: string;
  doctorId: string;
  roomId: string;
  serviceId: string;
  startAt: string;
  endAt?: string | null;
  reason?: string | null;
  notes?: string | null;
}

export interface UpsertPetRequest {
  ownerId?: string;
  speciesId: string;
  breedId?: string | null;
  name: string;
  sex: PetSex;
  birthDate?: string | null;
  weight?: number | null;
  photoUrl?: string | null;
  notes?: string | null;
}

export interface UpdateMedicalRecordRequest {
  symptoms?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  recommendations?: string | null;
}

export interface CreateMedicalRecordRequest {
  appointmentId: string;
  symptoms?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  recommendations?: string | null;
}

export interface StaffMemberResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  isProtected: boolean;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateDoctorStaffRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  experienceYears?: number | null;
  specializationIds?: string[] | null;
}

export interface ClientDirectoryResponse {
  ownerId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  petsCount: number;
  lastAppointmentAt?: string | null;
}

export interface AdminInsightsResponse {
  monthlyVisits: number;
  completedVisits: number;
  cancelledVisits: number;
  activeDoctors: number;
  monthlyTrend: MonthlyTrendPoint[];
  weeklyWorkload: WeeklyWorkloadPoint[];
  serviceDistribution: ServiceDistributionPoint[];
  speciesDistribution: SpeciesDistributionPoint[];
}

export interface MonthlyTrendPoint {
  month: string;
  appointments: number;
  completed: number;
}

export interface WeeklyWorkloadPoint {
  day: string;
  appointments: number;
}

export interface ServiceDistributionPoint {
  name: string;
  value: number;
}

export interface SpeciesDistributionPoint {
  name: string;
  value: number;
}

export interface VaccinationResponse {
  id: string;
  petId: string;
  petName: string;
  vaccineName: string;
  administeredDate: string;
  nextDueDate: string;
  status: string;
  administeredByDoctorName?: string | null;
}

export interface UpsertVaccinationRequest {
  petId: string;
  vaccineName: string;
  administeredDate: string;
  nextDueDate: string;
  administeredByDoctorId?: string | null;
}

export interface MedicalRecordResponse {
  id: string;
  appointmentId: string;
  appointmentDate: string;
  petId: string;
  petName: string;
  doctorId: string;
  doctorFullName: string;
  symptoms?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  recommendations?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}
