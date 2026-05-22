import { createBrowserRouter } from 'react-router';
import { RedirectOwnerToClient } from './RedirectOwnerToClient';
import { PremiumLandingPage } from './pages/redesign/PublicPages';
import { PremiumLoginPage } from './pages/redesign/PublicPages';
import { PremiumRegisterPage } from './pages/redesign/PublicPages';
import { ClientLayout } from './layouts/ClientLayout';
import { DoctorLayout } from './layouts/DoctorLayout';
import { AdminLayout } from './layouts/AdminLayout';
import {
  RedesignedAdminDashboard,
  RedesignedAdminInsights,
  RedesignedAppointmentManagement,
  RedesignedClientsManagement,
  RedesignedClinicCalendar,
  RedesignedClinicSettings,
  RedesignedDoctorAppointments,
  RedesignedDoctorDashboard,
  RedesignedDoctorManagement,
  RedesignedDoctorSchedule,
  RedesignedMedicalNotes,
  RedesignedMyPets,
  RedesignedOwnerAppointments,
  RedesignedOwnerDashboard,
  RedesignedOwnerMedicalHistory,
  RedesignedPetProfile,
  RedesignedProfilePage,
  RedesignedStaffManagement,
} from './pages/redesign/RolePages';

export const router = createBrowserRouter([
  { path: '/', Component: PremiumLandingPage },
  { path: '/login', Component: PremiumLoginPage },
  { path: '/register', Component: PremiumRegisterPage },
  { path: '/owner', Component: RedirectOwnerToClient },
  { path: '/owner/*', Component: RedirectOwnerToClient },
  {
    path: '/client',
    Component: ClientLayout,
    children: [
      { index: true, Component: RedesignedOwnerDashboard },
      { path: 'pets', Component: RedesignedMyPets },
      { path: 'pets/:id', Component: RedesignedPetProfile },
      { path: 'appointments', Component: RedesignedOwnerAppointments },
      { path: 'medical-history', Component: RedesignedOwnerMedicalHistory },
      { path: 'profile', Component: RedesignedProfilePage },
    ],
  },
  {
    path: '/doctor',
    Component: DoctorLayout,
    children: [
      { index: true, Component: RedesignedDoctorDashboard },
      { path: 'schedule', Component: RedesignedDoctorSchedule },
      { path: 'appointments', Component: RedesignedDoctorAppointments },
      { path: 'notes', Component: RedesignedMedicalNotes },
      { path: 'notes/:id', Component: RedesignedMedicalNotes },
      { path: 'profile', Component: RedesignedProfilePage },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: RedesignedAdminDashboard },
      { path: 'calendar', Component: RedesignedClinicCalendar },
      { path: 'appointments', Component: RedesignedAppointmentManagement },
      { path: 'doctors', Component: RedesignedDoctorManagement },
      { path: 'staff', Component: RedesignedStaffManagement },
      { path: 'clients', Component: RedesignedClientsManagement },
      { path: 'settings', Component: RedesignedClinicSettings },
      { path: 'insights', Component: RedesignedAdminInsights },
      { path: 'profile', Component: RedesignedProfilePage },
    ],
  },
]);
