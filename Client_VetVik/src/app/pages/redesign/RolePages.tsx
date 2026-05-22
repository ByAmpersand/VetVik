import type { SVGProps } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  MapPin,
  MessageSquare,
  PawPrint,
  Plus,
  Settings,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Upload,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  appointments,
  doctors,
  medicalRecords,
  monthlyTrend,
  pets,
  serviceTypes,
  vaccinations,
  weeklyWorkload,
} from '../../data/mockData';
import {
  AnalyticsCard,
  AppointmentCard,
  CalendarGrid,
  ClinicalNotePanel,
  ClientCard,
  DoctorCard,
  EmptyState,
  FilterBar,
  InsightItem,
  MedicalTimeline,
  MetricCard,
  PageHeader,
  PatientContextCard,
  PetAvatar,
  PetCard,
  PrimaryButton,
  SectionHeader,
  StatusBadge,
  Surface,
  UploadAvatar,
} from '../../components/redesign/VetVikUI';

const ownerPets = pets.filter((pet) => pet.ownerId === 'owner1');
const ownerAppointments = appointments.filter((appointment) => appointment.ownerId === 'owner1');
const todayAppointments = appointments.filter((appointment) => appointment.date === 'May 19, 2025');
const upcomingOwner = ownerAppointments.filter((appointment) => appointment.status === 'Scheduled');

export function RedesignedOwnerDashboard() {
  const navigate = useNavigate();
  const records = medicalRecords.filter((record) => ownerPets.some((pet) => pet.id === record.petId)).slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Owner home"
        title="Good morning, Anna. Luna's visit is coming up."
        description="A warm overview focused on care tasks, appointments, pet status, and reminders — no heavy analytics here."
        icon={PawPrint}
        actions={<PrimaryButton icon={Plus} onClick={() => navigate('/owner/appointments')}>Book appointment</PrimaryButton>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="Next appointment" description="The most important care event is always surfaced first." action={<PrimaryButton variant="secondary" icon={Calendar} onClick={() => navigate('/owner/appointments')}>Manage</PrimaryButton>} />
            {upcomingOwner[0] ? <AppointmentCard appointment={upcomingOwner[0]} /> : <EmptyState title="No appointment yet" description="Book a visit and it will appear here." />}
          </Surface>
          <div className="grid gap-4 md:grid-cols-3">
            {ownerPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onOpen={() => navigate(`/owner/pets/${pet.id}`)} onBook={() => navigate('/owner/appointments')} />
            ))}
          </div>
          <Surface className="p-5">
            <SectionHeader title="Recent medical updates" description="Clinical history as a readable care timeline." action={<button onClick={() => navigate('/owner/medical-history')} className="text-sm font-bold text-teal-700">View all</button>} />
            <MedicalTimeline records={records} />
          </Surface>
        </div>
        <div className="space-y-5">
          <MetricCard label="Pets in care" value={ownerPets.length} caption="Family profiles" icon={PawPrint} tone="teal" />
          <MetricCard label="Upcoming" value={upcomingOwner.length} caption="Scheduled visits" icon={Calendar} tone="blue" />
          <Surface className="p-5">
            <SectionHeader title="Care reminders" />
            <div className="space-y-3">
              {vaccinations.slice(0, 4).map((vaccine) => (
                <div key={vaccine.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <div>
                    <p className="font-black text-slate-900">{vaccine.vaccineName}</p>
                    <p className="text-sm text-slate-500">{vaccine.nextDue}</p>
                  </div>
                  <StatusBadge status={vaccine.status} />
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

export function RedesignedMyPets() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pet profiles"
        title="Every pet gets a richer identity card."
        description="Photos, health state, species context, last visit, and quick booking live together without becoming a table."
        icon={PawPrint}
        actions={<PrimaryButton icon={Plus}>Add pet</PrimaryButton>}
      />
      <FilterBar filters={['All pets', 'Healthy', 'Needs attention', 'Under treatment']} searchPlaceholder="Search pets by name, species, breed..." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ownerPets.map((pet) => (
          <PetCard key={pet.id} pet={pet} onOpen={() => navigate(`/owner/pets/${pet.id}`)} onBook={() => navigate('/owner/appointments')} />
        ))}
        <EmptyState title="Add another companion" description="Create a pet profile with species, breed, photo, weight and medical context." action={<PrimaryButton icon={Upload}>Upload pet profile</PrimaryButton>} />
      </div>
    </div>
  );
}

export function RedesignedPetProfile() {
  const navigate = useNavigate();
  const params = useParams();
  const pet = ownerPets.find((item) => item.id === params.id) ?? ownerPets[0];
  const records = medicalRecords.filter((record) => record.petId === pet.id);
  const petAppointments = appointments.filter((appointment) => appointment.petId === pet.id);

  return (
    <div className="space-y-6">
      <Surface className="relative overflow-hidden p-6">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-teal-100 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <PetAvatar species={pet.species} size="xl" />
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={pet.healthStatus} />
                <UploadAvatar />
              </div>
              <h1 className="text-5xl font-black tracking-[-0.07em] text-slate-950">{pet.name}</h1>
              <p className="mt-2 text-slate-600">{pet.breed} · {pet.age} years · {pet.gender} · {pet.weight}</p>
              <p className="mt-1 text-sm text-slate-400">Microchip: {pet.microchip ?? 'Not registered'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton variant="secondary" icon={FileText} onClick={() => navigate('/owner/medical-history')}>Medical timeline</PrimaryButton>
            <PrimaryButton icon={Calendar} onClick={() => navigate('/owner/appointments')}>Book visit</PrimaryButton>
          </div>
        </div>
      </Surface>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Surface className="p-5">
          <SectionHeader title="Medical timeline" description="Visits, diagnoses, treatments and follow-up notes." />
          <MedicalTimeline records={records.length ? records : medicalRecords.slice(0, 2)} />
        </Surface>
        <div className="space-y-5">
          <MetricCard label="Last visit" value={pet.lastVisit} caption="Most recent clinical contact" icon={Clock3} tone="blue" />
          <Surface className="p-5">
            <SectionHeader title="Upcoming & past visits" />
            <div className="space-y-3">
              {petAppointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} compact />)}
            </div>
          </Surface>
          <Surface className="p-5">
            <SectionHeader title="Vaccinations" />
            <div className="space-y-3">
              {vaccinations.filter((vaccine) => vaccine.petId === pet.id).map((vaccine) => (
                <div key={vaccine.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-slate-900">{vaccine.vaccineName}</p>
                    <StatusBadge status={vaccine.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Next due: {vaccine.nextDue}</p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

export function RedesignedOwnerAppointments() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Appointments" title="Book, filter, reschedule, and cancel visits." description="Workflow-focused appointment management for pet owners, with no distracting charts." icon={Calendar} actions={<PrimaryButton icon={Plus}>New booking</PrimaryButton>} />
      <FilterBar filters={['All', 'Scheduled', 'Completed', 'Cancelled', 'Luna', 'Max', 'Bella']} searchPlaceholder="Search appointment, pet, doctor..." />
      <div className="grid gap-4">
        {ownerAppointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}
      </div>
    </div>
  );
}

export function RedesignedOwnerMedicalHistory() {
  const records = medicalRecords.filter((record) => ownerPets.some((pet) => pet.id === record.petId));
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Medical history" title="A calm clinical timeline for every pet." description="Readable medical records, diagnoses, prescriptions, vaccinations, and follow-ups." icon={FileText} />
      <FilterBar filters={['All pets', 'Luna', 'Max', 'Bella', 'Vaccinations', 'Treatments']} searchPlaceholder="Search diagnosis, doctor, pet..." />
      <Surface className="p-5">
        <MedicalTimeline records={records} />
      </Surface>
    </div>
  );
}

export function RedesignedDoctorDashboard() {
  const doctorAppointments = appointments.filter((appointment) => appointment.doctorId === 'd1');
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Doctor today" title="Focused clinical day for Dr. Carter." description="Schedule, next appointment, pending notes, and patient access — without overloaded analytics." icon={Stethoscope} actions={<PrimaryButton icon={FileText}>Open next note</PrimaryButton>} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="Today's schedule" action={<PrimaryButton variant="secondary" icon={Calendar}>Full schedule</PrimaryButton>} />
            <div className="space-y-3">
              {doctorAppointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}
            </div>
          </Surface>
          <Surface className="p-5">
            <SectionHeader title="Pending clinical notes" />
            <div className="grid gap-3 md:grid-cols-2">
              {doctorAppointments.slice(0, 4).map((appointment) => (
                <InsightItem key={appointment.id} icon={FileText} tone={appointment.status === 'In progress' ? 'amber' : 'teal'} title={`${appointment.petName} · ${appointment.service}`} description="Draft note available. Complete symptoms, diagnosis, treatment and follow-up." />
              ))}
            </div>
          </Surface>
        </div>
        <div className="space-y-5">
          <MetricCard label="Next visit" value="09:00" caption="Luna · Room 1" icon={Clock3} tone="teal" />
          <MetricCard label="Notes due" value="3" caption="Before end of day" icon={FileText} tone="amber" />
          <Surface className="p-5">
            <SectionHeader title="Patient quick access" />
            <div className="space-y-3">
              {ownerPets.map((pet) => (
                <div key={pet.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <PetAvatar species={pet.species} size="sm" />
                  <div>
                    <p className="font-black text-slate-950">{pet.name}</p>
                    <p className="text-sm text-slate-500">{pet.breed}</p>
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

export function RedesignedDoctorSchedule() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Schedule" title="A visual day plan for real clinical work." description="Timeline blocks, appointment context, quick actions, and a mobile agenda fallback." icon={Calendar} />
      <FilterBar filters={['Today', 'Week', 'Month', 'Room 1', 'Room 2', 'Scheduled', 'In progress']} searchPlaceholder="Search schedule..." />
      <CalendarGrid appointments={appointments.filter((appointment) => appointment.doctorId === 'd1')} />
    </div>
  );
}

export function RedesignedDoctorAppointments() {
  const doctorAppointments = appointments.filter((appointment) => appointment.doctorId === 'd1');
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Doctor appointments" title="Clinical queue with patient and owner context." description="Time, reason, status, and actions remain visible without table fatigue." icon={ClipboardIcon} />
      <FilterBar filters={['All', 'Today', 'Scheduled', 'In progress', 'Completed']} searchPlaceholder="Search patient, owner, reason..." />
      <div className="grid gap-4">
        {doctorAppointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}
      </div>
    </div>
  );
}

function ClipboardIcon(props: SVGProps<SVGSVGElement>) {
  return <FileText {...props} />;
}

export function RedesignedMedicalNotes() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Medical notes" title="Clinical documentation that feels structured, not cramped." description="Patient context stays visible while the doctor writes symptoms, diagnosis, treatment, prescription and follow-up." icon={HeartPulse} />
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <PatientContextCard petName="Max" species="Cat" breed="British Shorthair" owner="Anna Smith" />
          <Surface className="p-5">
            <SectionHeader title="Visit context" />
            <div className="space-y-3">
              {['Skin irritation on back', 'Weight: 5.2 kg', 'Overdue rabies vaccine', 'Owner reports frequent scratching'].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  {item}
                </div>
              ))}
            </div>
          </Surface>
        </div>
        <ClinicalNotePanel />
      </div>
    </div>
  );
}

export function RedesignedAdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Clinic operations" title="Today’s clinic pulse, without analytics overload." description="Operational status, urgent items, doctor availability, and quick actions live here. Trends moved to Insights." icon={ShieldCheck} actions={<PrimaryButton icon={Plus}>Create appointment</PrimaryButton>} />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Visits today" value={todayAppointments.length} caption="Across all rooms" icon={Calendar} tone="teal" />
        <MetricCard label="Doctors active" value={doctors.filter((doctor) => doctor.status !== 'Off duty').length} caption="Ready for visits" icon={Stethoscope} tone="blue" />
        <MetricCard label="Urgent flags" value="2" caption="Need admin review" icon={AlertCircle} tone="amber" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Surface className="p-5">
          <SectionHeader title="Today's appointment flow" description="Operational queue only — no charts here." />
          <div className="space-y-3">
            {todayAppointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}
          </div>
        </Surface>
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="Doctor availability" />
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <div>
                    <p className="font-black text-slate-950">{doctor.name}</p>
                    <p className="text-sm text-slate-500">{doctor.specialization}</p>
                  </div>
                  <StatusBadge status={doctor.status} />
                </div>
              ))}
            </div>
          </Surface>
          <InsightItem icon={AlertCircle} tone="amber" title="Room 2 peaks at 10:30" description="Move one follow-up to Exam Room 1 to avoid a bottleneck." />
          <InsightItem icon={MessageSquare} tone="blue" title="3 owner confirmations pending" description="Send appointment reminders before noon." />
        </div>
      </div>
    </div>
  );
}

export function RedesignedClinicCalendar() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Clinic calendar" title="Multi-doctor, multi-room calendar for real clinic operations." description="Day/week/month controls, doctor filters, room filters, status filters, overlapping appointment blocks, and mobile agenda mode." icon={Calendar} actions={<PrimaryButton icon={Plus}>New appointment</PrimaryButton>} />
      <FilterBar filters={['Day', 'Week', 'Month', 'Dr. Carter', 'Dr. Wilson', 'Room 1', 'Room 2', 'Scheduled', 'In progress']} searchPlaceholder="Search calendar appointments..." />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <CalendarGrid appointments={todayAppointments} />
        <Surface className="p-5">
          <SectionHeader title="Appointment details" description="Select a block to manage the visit." />
          <AppointmentCard appointment={todayAppointments[0]} compact />
          <div className="mt-4 grid gap-2">
            <PrimaryButton icon={FileText}>Open record</PrimaryButton>
            <PrimaryButton variant="secondary" icon={Calendar}>Reschedule</PrimaryButton>
            <PrimaryButton variant="secondary" icon={MapPin}>Change room</PrimaryButton>
          </div>
        </Surface>
      </div>
    </div>
  );
}

export function RedesignedAppointmentManagement() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Appointment management" title="A powerful queue without unnecessary charts." description="Searchable, filterable, status-aware management view with edit/cancel/complete actions." icon={Calendar} actions={<PrimaryButton icon={Plus}>Create appointment</PrimaryButton>} />
      <FilterBar filters={['All', 'Today', 'Scheduled', 'In progress', 'Completed', 'Cancelled', 'No-show']} searchPlaceholder="Search appointment, owner, pet, doctor..." />
      <Surface className="overflow-hidden">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full">
            <thead className="bg-white/70">
              <tr>
                {['Time', 'Pet', 'Owner', 'Doctor', 'Service', 'Status', 'Actions'].map((head) => (
                  <th key={head} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-teal-50/35">
                  <td className="px-5 py-4 font-black text-slate-950">{appointment.date}<br /><span className="text-xs text-slate-400">{appointment.time}</span></td>
                  <td className="px-5 py-4">{appointment.petName}</td>
                  <td className="px-5 py-4">{appointment.ownerName}</td>
                  <td className="px-5 py-4">{appointment.doctorName}</td>
                  <td className="px-5 py-4">{appointment.service}</td>
                  <td className="px-5 py-4"><StatusBadge status={appointment.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {['Edit', 'Complete', 'Cancel'].map((action) => <button key={action} className="rounded-xl border border-slate-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">{action}</button>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-4 lg:hidden">
          {appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} compact />)}
        </div>
      </Surface>
    </div>
  );
}

export function RedesignedDoctorManagement() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Doctor management" title="Doctor profiles with schedule previews and availability." description="Specialization, contact info, daily load, and edit actions are surfaced in rich cards." icon={Stethoscope} actions={<PrimaryButton icon={Plus}>Add doctor</PrimaryButton>} />
      <FilterBar filters={['All', 'Available', 'Busy', 'Off duty', 'Surgery', 'Dermatology']} searchPlaceholder="Search doctor, specialization..." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
      </div>
    </div>
  );
}

export function RedesignedClientsManagement() {
  const clients = [
    { name: 'Anna Smith', phone: '+1 555-100-2000', petsCount: 3, lastAppointment: 'May 22' },
    { name: 'Tom Baker', phone: '+1 555-200-3000', petsCount: 1, lastAppointment: 'May 19' },
    { name: 'Maya Johnson', phone: '+1 555-300-4000', petsCount: 2, lastAppointment: 'Apr 29' },
    { name: 'Leo Martin', phone: '+1 555-404-1010', petsCount: 1, lastAppointment: 'Mar 12' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Clients" title="Owner relationships, pets, and follow-up context." description="A polished working client directory with contact info, pet counts, last appointment, search, filters, and quick actions." icon={Users} actions={<PrimaryButton icon={Plus}>Add client</PrimaryButton>} />
      <FilterBar filters={['All clients', 'Has upcoming', 'Needs follow-up', 'Multiple pets']} searchPlaceholder="Search owner, phone, pet..." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {clients.map((client) => <ClientCard key={client.name} {...client} />)}
      </div>
    </div>
  );
}

export function RedesignedClinicSettings() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Clinic settings with a product-grade setup flow." description="Clinic info, working hours, appointment duration, notifications, branding, and preferences." icon={Settings} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <SettingsPanel title="Clinic information" fields={['Clinic name', 'Address', 'Phone number', 'Email', 'Description']} />
          <Surface className="p-5">
            <SectionHeader title="Working hours" description="Clinic-level availability by weekday." />
            <div className="grid gap-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                <div key={day} className="grid items-center gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1fr_120px_120px_90px]">
                  <p className="font-black text-slate-800">{day}</p>
                  <input defaultValue={index === 6 ? 'Closed' : '09:00'} className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm" />
                  <input defaultValue={index === 6 ? 'Closed' : '19:00'} className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm" />
                  <StatusBadge status={index === 6 ? 'Off duty' : 'Available'} />
                </div>
              ))}
            </div>
          </Surface>
          <SettingsPanel title="Notification settings" fields={['Appointment reminders', 'Cancellation alerts', 'Doctor note reminders']} />
        </div>
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="Branding" description="Logo and visual identity." />
            <div className="rounded-[1.6rem] border border-dashed border-teal-200 bg-teal-50 p-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-teal-600" />
              <p className="mt-3 font-black text-teal-900">Upload clinic logo</p>
              <p className="mt-1 text-sm text-teal-700">PNG, SVG, or JPG</p>
            </div>
          </Surface>
          <MetricCard label="Default duration" value="30 min" caption="Appointment slot length" icon={Clock3} tone="amber" />
          <PrimaryButton icon={CheckCircle2}>Save settings</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ title, fields }: { title: string; fields: string[] }) {
  return (
    <Surface className="p-5">
      <SectionHeader title={title} />
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field} className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">{field}</span>
            <input className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm outline-none focus:border-teal-200 focus:bg-white focus:ring-4 focus:ring-teal-500/10" placeholder={field} />
          </label>
        ))}
      </div>
    </Surface>
  );
}

export function RedesignedProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Profile & account" title="One consistent profile and settings destination." description="The duplicated sidebar/header profile widgets are replaced by a single avatar menu that lands here." icon={Users} />
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Surface className="p-6 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-teal-400 to-amber-300 text-2xl font-black text-white shadow-xl">AS</div>
          <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] text-slate-950">Anna Smith</h2>
          <p className="text-sm text-slate-500">Role-based account profile</p>
          <div className="mt-5"><UploadAvatar label="Upload avatar" /></div>
        </Surface>
        <div className="space-y-5">
          <SettingsPanel title="My Profile" fields={['First name', 'Last name', 'Phone', 'Address']} />
          <SettingsPanel title="Account Settings" fields={['Email', 'Password', 'Language', 'Timezone']} />
          <Surface className="p-5">
            <SectionHeader title="Notifications" />
            <div className="grid gap-3">
              {['Appointment reminders', 'Medical record updates', 'Clinic announcements'].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3"><Bell className="h-4 w-4 text-teal-600" /><span className="font-bold text-slate-700">{item}</span></div>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-700">On</span>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

export function RedesignedAdminInsights() {
  const serviceData = serviceTypes.slice(0, 5).map((name, index) => ({ name, value: [24, 18, 14, 11, 8][index] }));
  const speciesData = [
    { name: 'Dog', value: 46, color: '#14b8a6' },
    { name: 'Cat', value: 31, color: '#38bdf8' },
    { name: 'Rabbit', value: 13, color: '#f59e0b' },
    { name: 'Bird', value: 10, color: '#fb7185' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin insights" title="Powerful clinic analytics in one dedicated place." description="Trends, workload, distribution, utilization, growth, and operational insights live here so regular pages stay focused." icon={BarChart3} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Monthly visits" value="72" caption="+24% vs April" icon={Calendar} tone="teal" />
        <MetricCard label="Completion ratio" value="83%" caption="Completed vs cancelled" icon={CheckCircle2} tone="green" />
        <MetricCard label="Clinic utilization" value="76%" caption="Rooms + doctors" icon={ShieldCheck} tone="blue" />
        <MetricCard label="Growth" value="+18%" caption="New clients monthly" icon={Users} tone="amber" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <AnalyticsCard title="Appointment trend">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="appointmentsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="appointments" stroke="#14b8a6" strokeWidth={3} fill="url(#appointmentsGradient)" />
              <Line type="monotone" dataKey="completed" stroke="#0ea5e9" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsCard>
        <AnalyticsCard title="Doctor workload">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={doctors.map((doctor) => ({ name: doctor.name.replace('Dr. ', ''), visits: doctor.todayAppointments }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="visits" radius={[12, 12, 0, 0]} fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>
        <AnalyticsCard title="Service distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={serviceData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 12, 12, 0]} fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>
        <AnalyticsCard title="Pet species distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={speciesData} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={4}>
                {speciesData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {speciesData.map((item) => <div key={item.name} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">{item.name}: {item.value}%</div>)}
          </div>
        </AnalyticsCard>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <AnalyticsCard title="Peak hours and clinic load">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyWorkload}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="appointments" fill="#f59e0b" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>
        <Surface className="p-5">
          <SectionHeader title="Operational insights" />
          <div className="space-y-3">
            <InsightItem title="High cancellation window" description="Cancellations cluster around Friday afternoon. Add reminders at T-24h." tone="amber" icon={AlertCircle} />
            <InsightItem title="Doctor load is balanced" description="No doctor exceeds the 85% sustainable threshold this week." tone="green" icon={CheckCircle2} />
            <InsightItem title="Vaccination demand is rising" description="Service distribution suggests adding a preventive-care block." tone="blue" icon={Syringe} />
          </div>
        </Surface>
      </div>
    </div>
  );
}
