/**
 * Mirrors the C# DTOs in Server_VetVik. Keep in sync manually for now
 * (Swashbuckle JSON could power code-generation later).
 */

export type Role = "Admin" | "Doctor" | "Owner";

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
}

// --- Clinic ---
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
  dayOfWeek: number;
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

// --- Pets ---
export interface AnimalSpeciesResponse {
  id: string;
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

export interface DoctorResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  photoUrl?: string | null;
  isActive: boolean;
  specializations: SpecializationResponse[];
}

export interface DoctorWorkingHourResponse {
  id: string;
  doctorId: string;
  dayOfWeek: number;
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
  doctorId: string;
  roomId: string;
  serviceId: string;
  startAt: string;
  endAt?: string | null;
  reason?: string | null;
  notes?: string | null;
  ownerId?: string | null;
}

// --- Medical records ---
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
