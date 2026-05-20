export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'In progress';
export type DoctorStatus = 'Available' | 'Busy' | 'Off duty';
export type PetHealthStatus = 'Healthy' | 'Needs Attention' | 'Under Treatment';
export type VaccinationStatus = 'Up to date' | 'Due soon' | 'Overdue';

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  lastVisit: string;
  healthStatus: PetHealthStatus;
  ownerId: string;
  weight: string;
  color: string;
  microchip?: string;
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  status: DoctorStatus;
  todayAppointments: number;
  avatar: string;
  experience: string;
}

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  petSpecies: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  service: string;
  status: AppointmentStatus;
  notes: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
}

export interface MedicalRecord {
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

export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  date: string;
  nextDue: string;
  status: VaccinationStatus;
  administeredBy: string;
}

export const pets: Pet[] = [
  { id: 'p1', name: 'Luna', species: 'Dog', breed: 'Golden Retriever', age: 3, gender: 'Female', lastVisit: 'May 10, 2025', healthStatus: 'Healthy', ownerId: 'owner1', weight: '28 kg', color: 'Golden', microchip: 'MC-2024-001' },
  { id: 'p2', name: 'Max', species: 'Cat', breed: 'British Shorthair', age: 5, gender: 'Male', lastVisit: 'Apr 22, 2025', healthStatus: 'Needs Attention', ownerId: 'owner1', weight: '5.2 kg', color: 'Gray', microchip: 'MC-2023-089' },
  { id: 'p3', name: 'Bella', species: 'Rabbit', breed: 'Holland Lop', age: 2, gender: 'Female', lastVisit: 'Mar 15, 2025', healthStatus: 'Healthy', ownerId: 'owner1', weight: '1.8 kg', color: 'White & Brown' },
  { id: 'p4', name: 'Rocky', species: 'Dog', breed: 'German Shepherd', age: 4, gender: 'Male', lastVisit: 'May 18, 2025', healthStatus: 'Under Treatment', ownerId: 'owner2', weight: '35 kg', color: 'Black & Tan', microchip: 'MC-2022-445' },
];

export const doctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Olivia Carter', specialization: 'General Veterinary', email: 'o.carter@vetvik.com', phone: '+1 (555) 001-1234', status: 'Available', todayAppointments: 8, avatar: 'OC', experience: '12 years' },
  { id: 'd2', name: 'Dr. Mark Wilson', specialization: 'Surgery & Orthopedics', email: 'm.wilson@vetvik.com', phone: '+1 (555) 002-5678', status: 'Busy', todayAppointments: 6, avatar: 'MW', experience: '9 years' },
  { id: 'd3', name: 'Dr. Emily Brown', specialization: 'Dermatology', email: 'e.brown@vetvik.com', phone: '+1 (555) 003-9012', status: 'Available', todayAppointments: 4, avatar: 'EB', experience: '7 years' },
];

export const appointments: Appointment[] = [
  { id: 'a1', petId: 'p1', petName: 'Luna', petSpecies: 'Dog', ownerId: 'owner1', ownerName: 'Anna Smith', ownerPhone: '+1 555-100-2000', doctorId: 'd1', doctorName: 'Dr. Olivia Carter', date: 'May 22, 2025', time: '10:00 AM', service: 'General checkup', status: 'Scheduled', notes: 'Annual health checkup' },
  { id: 'a2', petId: 'p2', petName: 'Max', petSpecies: 'Cat', ownerId: 'owner1', ownerName: 'Anna Smith', ownerPhone: '+1 555-100-2000', doctorId: 'd3', doctorName: 'Dr. Emily Brown', date: 'May 25, 2025', time: '2:00 PM', service: 'Dermatology consultation', status: 'Scheduled', notes: 'Skin irritation on back' },
  { id: 'a3', petId: 'p3', petName: 'Bella', petSpecies: 'Rabbit', ownerId: 'owner1', ownerName: 'Anna Smith', ownerPhone: '+1 555-100-2000', doctorId: 'd1', doctorName: 'Dr. Olivia Carter', date: 'Apr 10, 2025', time: '11:00 AM', service: 'Vaccination', status: 'Completed', notes: '', diagnosis: 'Healthy', treatment: 'Annual vaccine administered' },
  { id: 'a4', petId: 'p1', petName: 'Luna', petSpecies: 'Dog', ownerId: 'owner1', ownerName: 'Anna Smith', ownerPhone: '+1 555-100-2000', doctorId: 'd2', doctorName: 'Dr. Mark Wilson', date: 'Mar 5, 2025', time: '9:00 AM', service: 'Dental care', status: 'Completed', notes: '', diagnosis: 'Mild tartar buildup', treatment: 'Professional dental cleaning performed' },
  { id: 'a5', petId: 'p4', petName: 'Rocky', petSpecies: 'Dog', ownerId: 'owner2', ownerName: 'Tom Baker', ownerPhone: '+1 555-200-3000', doctorId: 'd1', doctorName: 'Dr. Olivia Carter', date: 'May 19, 2025', time: '11:30 AM', service: 'Surgery follow-up', status: 'In progress', notes: 'Post-surgery check' },
  { id: 'a6', petId: 'p2', petName: 'Max', petSpecies: 'Cat', ownerId: 'owner1', ownerName: 'Anna Smith', ownerPhone: '+1 555-100-2000', doctorId: 'd2', doctorName: 'Dr. Mark Wilson', date: 'Feb 20, 2025', time: '3:00 PM', service: 'General checkup', status: 'Cancelled', notes: 'Owner cancelled' },
  { id: 'a7', petId: 'p1', petName: 'Luna', petSpecies: 'Dog', ownerId: 'owner1', ownerName: 'Anna Smith', ownerPhone: '+1 555-100-2000', doctorId: 'd1', doctorName: 'Dr. Olivia Carter', date: 'May 19, 2025', time: '9:00 AM', service: 'General checkup', status: 'In progress', notes: '' },
  { id: 'a8', petId: 'p2', petName: 'Max', petSpecies: 'Cat', ownerId: 'owner1', ownerName: 'Anna Smith', ownerPhone: '+1 555-100-2000', doctorId: 'd1', doctorName: 'Dr. Olivia Carter', date: 'May 19, 2025', time: '10:30 AM', service: 'Vaccination', status: 'Scheduled', notes: '' },
  { id: 'a9', petId: 'p3', petName: 'Bella', petSpecies: 'Rabbit', ownerId: 'owner1', ownerName: 'Anna Smith', ownerPhone: '+1 555-100-2000', doctorId: 'd3', doctorName: 'Dr. Emily Brown', date: 'May 19, 2025', time: '1:00 PM', service: 'Dermatology consultation', status: 'Scheduled', notes: '' },
  { id: 'a10', petId: 'p4', petName: 'Rocky', petSpecies: 'Dog', ownerId: 'owner2', ownerName: 'Tom Baker', ownerPhone: '+1 555-200-3000', doctorId: 'd2', doctorName: 'Dr. Mark Wilson', date: 'May 19, 2025', time: '3:30 PM', service: 'Surgery follow-up', status: 'Scheduled', notes: '' },
];

export const medicalRecords: MedicalRecord[] = [
  { id: 'mr1', petId: 'p1', petName: 'Luna', date: 'Apr 10, 2025', doctorId: 'd1', doctorName: 'Dr. Olivia Carter', reason: 'Routine checkup', diagnosis: 'Healthy, all vitals normal', treatment: 'No treatment needed', nextVisit: 'Oct 10, 2025' },
  { id: 'mr2', petId: 'p1', petName: 'Luna', date: 'Mar 5, 2025', doctorId: 'd2', doctorName: 'Dr. Mark Wilson', reason: 'Dental care', diagnosis: 'Mild tartar buildup', treatment: 'Professional dental cleaning', prescription: 'Dental chews recommended', nextVisit: 'Sep 5, 2025' },
  { id: 'mr3', petId: 'p2', petName: 'Max', date: 'Apr 22, 2025', doctorId: 'd3', doctorName: 'Dr. Emily Brown', reason: 'Skin irritation', diagnosis: 'Mild dermatitis', treatment: 'Topical corticosteroid applied', prescription: 'Dermovate cream 2x daily for 7 days', nextVisit: 'May 22, 2025' },
  { id: 'mr4', petId: 'p3', petName: 'Bella', date: 'Mar 15, 2025', doctorId: 'd1', doctorName: 'Dr. Olivia Carter', reason: 'Annual vaccination', diagnosis: 'Healthy', treatment: 'RHD vaccination administered', nextVisit: 'Mar 15, 2026' },
  { id: 'mr5', petId: 'p4', petName: 'Rocky', date: 'May 1, 2025', doctorId: 'd2', doctorName: 'Dr. Mark Wilson', reason: 'Leg injury', diagnosis: 'Torn anterior cruciate ligament', treatment: 'TPLO surgery performed', prescription: 'Carprofen 50mg 2x daily', nextVisit: 'May 19, 2025' },
];

export const vaccinations: Vaccination[] = [
  { id: 'v1', petId: 'p1', vaccineName: 'Rabies', date: 'Jan 15, 2025', nextDue: 'Jan 15, 2026', status: 'Up to date', administeredBy: 'Dr. Olivia Carter' },
  { id: 'v2', petId: 'p1', vaccineName: 'DHPP (Distemper)', date: 'Jan 15, 2025', nextDue: 'Jan 15, 2026', status: 'Up to date', administeredBy: 'Dr. Olivia Carter' },
  { id: 'v3', petId: 'p1', vaccineName: 'Bordetella', date: 'Jul 10, 2024', nextDue: 'Jul 10, 2025', status: 'Due soon', administeredBy: 'Dr. Olivia Carter' },
  { id: 'v4', petId: 'p2', vaccineName: 'Rabies', date: 'Mar 20, 2024', nextDue: 'Mar 20, 2025', status: 'Overdue', administeredBy: 'Dr. Emily Brown' },
  { id: 'v5', petId: 'p2', vaccineName: 'FVRCP', date: 'Mar 20, 2024', nextDue: 'Mar 20, 2025', status: 'Overdue', administeredBy: 'Dr. Emily Brown' },
  { id: 'v6', petId: 'p3', vaccineName: 'RHD', date: 'Mar 15, 2025', nextDue: 'Mar 15, 2026', status: 'Up to date', administeredBy: 'Dr. Olivia Carter' },
  { id: 'v7', petId: 'p3', vaccineName: 'Myxomatosis', date: 'Mar 15, 2025', nextDue: 'Mar 15, 2026', status: 'Up to date', administeredBy: 'Dr. Olivia Carter' },
];

export const weeklyWorkload = [
  { day: 'Mon', appointments: 12 },
  { day: 'Tue', appointments: 9 },
  { day: 'Wed', appointments: 15 },
  { day: 'Thu', appointments: 11 },
  { day: 'Fri', appointments: 8 },
  { day: 'Sat', appointments: 5 },
  { day: 'Sun', appointments: 0 },
];

export const monthlyTrend = [
  { month: 'Jan', appointments: 48, completed: 42 },
  { month: 'Feb', appointments: 52, completed: 47 },
  { month: 'Mar', appointments: 61, completed: 58 },
  { month: 'Apr', appointments: 58, completed: 53 },
  { month: 'May', appointments: 72, completed: 60 },
];

export const petSpeciesEmoji: Record<string, string> = {
  Dog: '🐕',
  Cat: '🐈',
  Rabbit: '🐇',
  Bird: '🦜',
  Fish: '🐠',
  Hamster: '🐹',
};

export const serviceTypes = [
  'General checkup',
  'Vaccination',
  'Dental care',
  'Dermatology consultation',
  'Surgery follow-up',
  'Emergency visit',
  'Nutritional consultation',
  'Orthopedic evaluation',
];

export const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];
