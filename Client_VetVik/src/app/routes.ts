import { createBrowserRouter } from 'react-router';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OwnerLayout } from './layouts/OwnerLayout';
import { DoctorLayout } from './layouts/DoctorLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { MyPets } from './pages/owner/MyPets';
import { PetProfile } from './pages/owner/PetProfile';
import { OwnerAppointments } from './pages/owner/OwnerAppointments';
import { OwnerMedicalHistory } from './pages/owner/OwnerMedicalHistory';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorSchedule } from './pages/doctor/DoctorSchedule';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments';
import { MedicalNotes } from './pages/doctor/MedicalNotes';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ClinicCalendar } from './pages/admin/ClinicCalendar';
import { AppointmentManagement } from './pages/admin/AppointmentManagement';
import { DoctorManagement } from './pages/admin/DoctorManagement';
import { ClientsManagement } from './pages/admin/ClientsManagement';
import { ClinicSettings } from './pages/admin/ClinicSettings';
import { ProfilePage } from './pages/shared/ProfilePage';

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  {
    path: '/owner',
    Component: OwnerLayout,
    children: [
      { index: true, Component: OwnerDashboard },
      { path: 'pets', Component: MyPets },
      { path: 'pets/:id', Component: PetProfile },
      { path: 'appointments', Component: OwnerAppointments },
      { path: 'medical-history', Component: OwnerMedicalHistory },
      { path: 'profile', Component: ProfilePage },
    ],
  },
  {
    path: '/doctor',
    Component: DoctorLayout,
    children: [
      { index: true, Component: DoctorDashboard },
      { path: 'schedule', Component: DoctorSchedule },
      { path: 'appointments', Component: DoctorAppointments },
      { path: 'notes', Component: MedicalNotes },
      { path: 'notes/:id', Component: MedicalNotes },
      { path: 'profile', Component: ProfilePage },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'calendar', Component: ClinicCalendar },
      { path: 'appointments', Component: AppointmentManagement },
      { path: 'doctors', Component: DoctorManagement },
      { path: 'clients', Component: ClientsManagement },
      { path: 'settings', Component: ClinicSettings },
      { path: 'profile', Component: ProfilePage },
    ],
  },
]);
