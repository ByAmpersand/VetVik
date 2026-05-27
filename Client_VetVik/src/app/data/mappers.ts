import type {
  AppointmentResponse,
  DoctorResponse,
  MedicalRecordResponse,
  PetResponse,
  VaccinationResponse,
} from '../../api/types';
import {
  calcAge,
  doctorDisplayName,
  doctorInitials,
  formatDate,
  formatTime,
  mapAppointmentStatus,
  mapPetHealthStatus,
} from './formatters';
import { parseCustomBreedFromNotes, resolvePetBreedName } from '../utils/petFormHelpers';

export interface PetViewModel {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  lastVisit: string;
  healthStatus: string;
  ownerId: string;
  weight: string;
  color: string;
  microchip?: string;
  notes?: string;
  photoUrl?: string | null;
}

export interface AppointmentViewModel {
  id: string;
  petId: string;
  petName: string;
  petSpecies: string;
  petPhotoUrl?: string | null;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  doctorId: string;
  doctorName: string;
  roomId: string;
  roomName: string;
  date: string;
  time: string;
  startAt: string;
  endAt: string;
  service: string;
  status: string;
  notes: string;
  reason: string;
}

export interface MedicalRecordViewModel {
  id: string;
  petId: string;
  petName: string;
  date: string;
  doctorId: string;
  doctorName: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  nextVisit?: string;
}

export interface DoctorViewModel {
  id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  status: string;
  todayAppointments: number;
  totalAppointments: number;
  avatar: string;
  avatarUrl?: string | null;
  experience: string;
}

export interface VaccinationViewModel {
  id: string;
  petId: string;
  vaccineName: string;
  date: string;
  nextDue: string;
  status: string;
  administeredBy: string;
}

export function buildLastVisitByPetId(
  records: MedicalRecordResponse[],
  appointments: AppointmentResponse[] = [],
): Map<string, string> {
  const lastVisitByPetId = new Map<string, string>();

  for (const record of records) {
    const existing = lastVisitByPetId.get(record.petId);
    if (!existing || record.appointmentDate.localeCompare(existing) > 0) {
      lastVisitByPetId.set(record.petId, record.appointmentDate);
    }
  }

  for (const appointment of appointments) {
    if (appointment.status !== 'Completed') continue;
    const existing = lastVisitByPetId.get(appointment.petId);
    if (!existing || appointment.startAt.localeCompare(existing) > 0) {
      lastVisitByPetId.set(appointment.petId, appointment.startAt);
    }
  }

  return lastVisitByPetId;
}

export function mapPet(
  pet: PetResponse,
  opts?: { lastVisit?: string | null; overdueVaccines?: boolean },
): PetViewModel {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.speciesName,
    breed: resolvePetBreedName(pet.breedName, pet.notes),
    age: calcAge(pet.birthDate),
    gender: pet.sex === 'Unknown' ? 'Unknown' : pet.sex,
    lastVisit: formatDate(opts?.lastVisit),
    healthStatus: mapPetHealthStatus(!!opts?.overdueVaccines, true),
    ownerId: pet.ownerId,
    weight: pet.weight != null ? `${pet.weight} kg` : '—',
    color: '—',
    notes: parseCustomBreedFromNotes(pet.notes).careNotes || undefined,
    photoUrl: pet.photoUrl ?? null,
  };
}

export function attachPetPhotosToAppointments(
  appointments: AppointmentViewModel[],
  pets: Array<{ id: string; photoUrl?: string | null }>,
): AppointmentViewModel[] {
  const photoByPetId = new Map(pets.map((pet) => [pet.id, pet.photoUrl ?? null]));
  return appointments.map((appointment) => ({
    ...appointment,
    petPhotoUrl: photoByPetId.get(appointment.petId) ?? appointment.petPhotoUrl ?? null,
  }));
}

export function mapAppointment(a: AppointmentResponse): AppointmentViewModel {
  return {
    id: a.id,
    petId: a.petId,
    petName: a.petName,
    petSpecies: a.petSpecies,
    petPhotoUrl: null,
    ownerId: a.ownerId,
    ownerName: a.ownerFullName,
    ownerPhone: '',
    doctorId: a.doctorId,
    doctorName: a.doctorFullName,
    roomId: a.roomId,
    roomName: a.roomName,
    date: formatDate(a.startAt),
    time: formatTime(a.startAt),
    startAt: a.startAt,
    endAt: a.endAt,
    service: a.serviceName,
    status: mapAppointmentStatus(a.status),
    notes: a.notes ?? '',
    reason: a.reason ?? '',
  };
}

export function mapMedicalRecord(r: MedicalRecordResponse): MedicalRecordViewModel {
  return {
    id: r.id,
    petId: r.petId,
    petName: r.petName,
    date: formatDate(r.appointmentDate),
    doctorId: r.doctorId,
    doctorName: r.doctorFullName,
    reason: r.symptoms ?? 'Visit',
    diagnosis: r.diagnosis ?? '—',
    treatment: r.treatment ?? '—',
    prescription: r.recommendations ?? undefined,
  };
}

function formatDoctorExperience(experienceYears?: number | null): string {
  if (experienceYears == null || !Number.isFinite(experienceYears) || experienceYears < 0) {
    return 'Not set';
  }

  const rounded = Math.round(experienceYears);
  return `${rounded} year${rounded === 1 ? '' : 's'}`;
}

export function mapDoctor(
  d: DoctorResponse,
  appointments: AppointmentResponse[] = [],
): DoctorViewModel {
  const todayKey = new Date().toDateString();
  const doctorAppointments = appointments.filter((a) => a.doctorId === d.id);
  const todayAppointments = doctorAppointments.filter((a) => new Date(a.startAt).toDateString() === todayKey).length;
  return {
    id: d.id,
    name: doctorDisplayName(d.firstName, d.lastName),
    specialization: d.specializations[0]?.name ?? 'General Veterinary',
    email: d.email,
    phone: '—',
    status: d.isActive ? 'Available' : 'Off duty',
    todayAppointments,
    totalAppointments: doctorAppointments.length,
    avatar: doctorInitials(d.firstName, d.lastName),
    avatarUrl: d.photoUrl ?? null,
    experience: formatDoctorExperience(d.experienceYears),
  };
}

export function mapVaccination(v: VaccinationResponse): VaccinationViewModel {
  return {
    id: v.id,
    petId: v.petId,
    vaccineName: v.vaccineName,
    date: formatDate(v.administeredDate),
    nextDue: formatDate(v.nextDueDate),
    status: v.status,
    administeredBy: v.administeredByDoctorName ?? 'Clinic staff',
  };
}
