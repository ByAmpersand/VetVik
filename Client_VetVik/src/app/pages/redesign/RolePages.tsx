import { useEffect, useState, type FormEvent, type ReactNode, type SVGProps } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  HeartPulse,
  PawPrint,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Stethoscope,
  Trash2,
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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../auth/AuthContext';
import { canManageAdmins, canManageDoctors, canDeleteUser, roleLabel } from '../../auth/roles';
import { formatDate } from '../../data/formatters';
import {
  appointmentsApi,
  clinicApi,
  doctorsApi,
  medicalRecordsApi,
  petsApi,
  staffApi,
} from '../../../api/endpoints';
import {
  mapAppointment,
  mapDoctor,
  mapMedicalRecord,
  mapPet,
  mapVaccination,
} from '../../data/mappers';
import {
  useAdminAppointments,
  useAdminInsights,
  useAllPets,
  useBreeds,
  useClientsDirectory,
  useClinicSettings,
  useCurrentUserProfile,
  useDoctors,
  useDoctorAppointments,
  useMedicalRecordByAppointment,
  useOwnerAppointments,
  useOwnerMedicalRecords,
  useOwnerPets,
  useOwnerVaccinations,
  usePetById,
  usePetMedicalRecords,
  usePetVaccinations,
  useRooms,
  useServices,
  useSpecializations,
  useSpecies,
  useStaffMembers,
} from '../../hooks/useClinicData';
import { useAppointmentActions } from '../../hooks/useAppointmentActions';
import {
  FormActions,
  FormCheckboxList,
  FormDialog,
  FormErrorMessage,
  FormField,
  FormGrid,
  FormSelect,
  FormSwitchRow,
  FormTextArea,
  type SelectOption,
} from '../../components/redesign/FormDialog';
import {
  AnalyticsCard,
  AppointmentCard,
  CalendarGrid,
  ClientCard,
  DoctorCard,
  EmptyState,
  FilterBar,
  InsightItem,
  MedicalTimeline,
  MetricCard,
  PageHeader,
  PetAvatar,
  PetCard,
  PrimaryButton,
  SectionHeader,
  StatusBadge,
  Surface,
  UploadAvatar,
} from '../../components/redesign/VetVikUI';
import type {
  AppointmentResponse,
  ClinicSettingsResponse,
  ClinicWorkingHourResponse,
  CreateAdminRequest,
  CreateAppointmentRequest,
  CreateDoctorStaffRequest,
  CreateMedicalRecordRequest,
  DoctorResponse,
  MedicalRecordResponse,
  PetResponse,
  UpdateAppointmentRequest,
  UpdateMedicalRecordRequest,
  UpsertClinicWorkingHourRequest,
  UpsertPetRequest,
} from '../../../api/types';
import { formatApiError, mapApiErrorsToFields, validateEmail, validateName, validatePassword, validateRequired } from '../../utils/formValidation';
import {
  buildPetNotes,
  OTHER_BREED_VALUE,
  parseCustomBreedFromNotes,
} from '../../utils/petFormHelpers';

function DataState({ loading, error, children }: Readonly<{ loading: boolean; error: string | null; children: ReactNode }>) {
  if (loading) {
    return (
      <Surface className="p-8 text-center">
        <p className="text-sm font-bold text-slate-400">Loading clinic data...</p>
      </Surface>
    );
  }
  if (error) {
    return (
      <EmptyState title="Could not load data" description={error} />
    );
  }
  return <>{children}</>;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function toDateTimeInputValue(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function timeValue(value?: string | null): string {
  if (!value) return '09:00';
  const parts = value.split(':');
  return `${parts[0] ?? '09'}:${parts[1] ?? '00'}`;
}

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toggleSelection(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function buildPetDraft(pet?: PetResponse) {
  const { customBreed, careNotes } = parseCustomBreedFromNotes(pet?.notes);
  const usesCustomBreed = !pet?.breedId && Boolean(customBreed);

  return {
    speciesId: pet?.speciesId ?? '',
    breedId: usesCustomBreed ? OTHER_BREED_VALUE : (pet?.breedId ?? ''),
    customBreed: usesCustomBreed ? customBreed : '',
    name: pet?.name ?? '',
    sex: pet?.sex ?? 'Unknown',
    birthDate: toDateInputValue(pet?.birthDate),
    weight: pet?.weight != null ? String(pet.weight) : '',
    notes: careNotes,
  };
}

function PetFormDialog({
  open,
  pet,
  loading,
  error,
  onClose,
  onSubmit,
}: Readonly<{
  open: boolean;
  pet?: PetResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (body: Omit<UpsertPetRequest, 'ownerId'>) => Promise<void>;
}>) {
  const speciesState = useSpecies(false);
  const [draft, setDraft] = useState(() => buildPetDraft(pet ?? undefined));
  const breedsState = useBreeds(draft.speciesId || undefined, false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const speciesOptions = speciesState.data.map((species) => ({ value: species.id, label: species.name }));
  const breedOptions: SelectOption[] = [
    ...breedsState.data.map((breed) => ({ value: breed.id, label: breed.name })),
    { value: OTHER_BREED_VALUE, label: 'Other' },
  ];
  const breedsDisabled = !draft.speciesId;

  useEffect(() => {
    if (open) {
      setDraft(buildPetDraft(pet ?? undefined));
      setFieldErrors({});
    }
  }, [open, pet]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    nextErrors.name = validateRequired(draft.name, 'Pet name') ?? '';
    if (!draft.speciesId) nextErrors.speciesId = 'Species is required.';
    if (draft.breedId === OTHER_BREED_VALUE && !draft.customBreed.trim()) {
      nextErrors.customBreed = 'Enter the breed name or choose one from the list.';
    }
    const weight = parseNumber(draft.weight);
    if (draft.weight.trim() && weight == null) nextErrors.weight = 'Weight must be a number.';
    const normalizedErrors = Object.fromEntries(Object.entries(nextErrors).filter(([, value]) => value));
    setFieldErrors(normalizedErrors);
    if (Object.keys(normalizedErrors).length > 0) return;

    const usesCustomBreed = draft.breedId === OTHER_BREED_VALUE;
    const body: Omit<UpsertPetRequest, 'ownerId'> = {
      speciesId: draft.speciesId,
      breedId: usesCustomBreed ? null : (draft.breedId || null),
      name: draft.name.trim(),
      sex: draft.sex as UpsertPetRequest['sex'],
      birthDate: draft.birthDate || null,
      weight,
      photoUrl: null,
      notes: buildPetNotes(usesCustomBreed ? draft.customBreed : '', draft.notes),
    };

    try {
      await onSubmit(body);
    } catch (submitError) {
      const apiFieldErrors = mapApiErrorsToFields(submitError);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...apiFieldErrors }));
      }
    }
  };

  return (
    <FormDialog
      open={open}
      title={pet ? 'Edit pet profile' : 'Add a pet'}
      description="Save the pet identity, species and care notes directly to the clinic backend."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <FormGrid columns={2}>
          <FormField
            label="Pet name"
            value={draft.name}
            onChange={(value) => setDraft((prev) => ({ ...prev, name: value }))}
            error={fieldErrors.name}
            required
          />
          <FormSelect
            label="Sex"
            value={draft.sex}
            onChange={(value) => setDraft((prev) => ({ ...prev, sex: value }))}
            options={[
              { value: 'Unknown', label: 'Unknown' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
            ]}
          />
          <FormSelect
            label="Species"
            value={draft.speciesId}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                speciesId: value,
                breedId: '',
                customBreed: '',
              }))
            }
            options={speciesOptions}
            placeholder="Select species"
            error={fieldErrors.speciesId}
          />
          <FormSelect
            label="Breed"
            value={draft.breedId}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                breedId: value,
                customBreed: value === OTHER_BREED_VALUE ? prev.customBreed : '',
              }))
            }
            options={breedsDisabled ? [] : breedOptions}
            placeholder={breedsDisabled ? 'Select species first' : 'Optional breed'}
            error={fieldErrors.breedId}
          />
          {draft.breedId === OTHER_BREED_VALUE ? (
            <FormField
              label="Other breed"
              value={draft.customBreed}
              onChange={(value) => setDraft((prev) => ({ ...prev, customBreed: value }))}
              placeholder="Enter breed name"
              error={fieldErrors.customBreed}
              required
            />
          ) : null}
          <FormField
            label="Birth date"
            type="date"
            value={draft.birthDate}
            onChange={(value) => setDraft((prev) => ({ ...prev, birthDate: value }))}
          />
          <FormField
            label="Weight (kg)"
            type="number"
            step="0.1"
            min="0"
            value={draft.weight}
            onChange={(value) => setDraft((prev) => ({ ...prev, weight: value }))}
            error={fieldErrors.weight}
          />
        </FormGrid>
        <div className="mt-4">
          <FormTextArea
            label="Care notes"
            value={draft.notes}
            onChange={(value) => setDraft((prev) => ({ ...prev, notes: value }))}
            placeholder="Allergies, temperament, special instructions..."
          />
        </div>
        <FormErrorMessage message={error} />
        <FormActions onCancel={onClose} submitLabel={pet ? 'Save changes' : 'Create pet'} submittingLabel="Saving..." loading={loading} />
      </form>
    </FormDialog>
  );
}

function buildAppointmentDraft(appointment?: AppointmentResponse | null) {
  return {
    petId: appointment?.petId ?? '',
    doctorId: appointment?.doctorId ?? '',
    roomId: appointment?.roomId ?? '',
    serviceId: appointment?.serviceId ?? '',
    startAt: toDateTimeInputValue(appointment?.startAt),
    reason: appointment?.reason ?? '',
    notes: appointment?.notes ?? '',
  };
}

function formatDoctorOptionLabel(doctor: DoctorResponse): string {
  const name = `Dr. ${doctor.firstName} ${doctor.lastName}`.trim();
  const specializations = doctor.specializations
    .filter((item) => item.isActive)
    .map((item) => item.name)
    .join(', ');
  return specializations ? `${name} · ${specializations}` : name;
}

function AppointmentFormDialog({
  open,
  title,
  description,
  appointment,
  pets,
  doctors,
  rooms,
  services,
  loading,
  error,
  onClose,
  onSubmit,
  variant = 'clinic',
}: Readonly<{
  open: boolean;
  title: string;
  description: string;
  appointment?: AppointmentResponse | null;
  pets: Array<{ id: string; name: string; ownerName?: string }>;
  doctors: DoctorResponse[];
  rooms: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string; durationMinutes?: number }>;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (body: CreateAppointmentRequest | UpdateAppointmentRequest) => Promise<void>;
  variant?: 'owner' | 'clinic';
}>) {
  const isOwnerBooking = variant === 'owner';
  const bookableDoctors = doctors.filter((doctor) => doctor.isActive);
  const [draft, setDraft] = useState(() => buildAppointmentDraft(appointment));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setDraft(buildAppointmentDraft(appointment));
      setFieldErrors({});
    }
  }, [appointment, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!draft.petId) nextErrors.petId = 'Pet is required.';
    if (!draft.serviceId) nextErrors.serviceId = 'Service is required.';
    if (!draft.doctorId) nextErrors.doctorId = 'Doctor is required.';
    if (!isOwnerBooking && !draft.roomId) nextErrors.roomId = 'Room is required.';
    if (!draft.startAt) nextErrors.startAt = 'Start time is required.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      petId: draft.petId,
      doctorId: draft.doctorId,
      serviceId: draft.serviceId,
      startAt: new Date(draft.startAt).toISOString(),
      endAt: null,
      reason: draft.reason.trim() || null,
      notes: isOwnerBooking ? null : draft.notes.trim() || null,
    };

    if (isOwnerBooking) {
      await onSubmit(payload as CreateAppointmentRequest);
      return;
    }

    await onSubmit({
      ...payload,
      roomId: draft.roomId,
      notes: draft.notes.trim() || null,
    });
  };

  return (
    <FormDialog open={open} title={title} description={description} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormGrid columns={2}>
          <FormSelect
            label="Pet"
            value={draft.petId}
            onChange={(value) => setDraft((prev) => ({ ...prev, petId: value }))}
            options={pets.map((pet) => ({
              value: pet.id,
              label: pet.ownerName ? `${pet.name} · ${pet.ownerName}` : pet.name,
            }))}
            placeholder={pets.length ? 'Select pet' : 'Add a pet first'}
            error={fieldErrors.petId}
          />
          <FormSelect
            label="Service"
            value={draft.serviceId}
            onChange={(value) => setDraft((prev) => ({ ...prev, serviceId: value }))}
            options={services.map((service) => ({
              value: service.id,
              label: service.durationMinutes ? `${service.name} · ${service.durationMinutes} min` : service.name,
            }))}
            placeholder={services.length ? 'Select service' : 'No services available'}
            error={fieldErrors.serviceId}
          />
          <FormSelect
            label="Doctor"
            value={draft.doctorId}
            onChange={(value) => setDraft((prev) => ({ ...prev, doctorId: value }))}
            options={bookableDoctors.map((doctor) => ({
              value: doctor.id,
              label: formatDoctorOptionLabel(doctor),
            }))}
            placeholder={bookableDoctors.length ? 'Select doctor' : 'No doctors available'}
            error={fieldErrors.doctorId}
          />
          {!isOwnerBooking ? (
            <FormSelect
              label="Room"
              value={draft.roomId}
              onChange={(value) => setDraft((prev) => ({ ...prev, roomId: value }))}
              options={rooms.map((room) => ({ value: room.id, label: room.name }))}
              placeholder={rooms.length ? 'Select room' : 'No rooms available'}
              error={fieldErrors.roomId}
            />
          ) : null}
          <FormField
            label="Visit start"
            type="datetime-local"
            value={draft.startAt}
            onChange={(value) => setDraft((prev) => ({ ...prev, startAt: value }))}
            error={fieldErrors.startAt}
          />
        </FormGrid>
        {isOwnerBooking ? (
          <p className="mt-4 text-sm leading-6 text-slate-400">
            The clinic will assign an exam room after you submit the booking.
          </p>
        ) : null}
        <div className="mt-4">
          <FormTextArea
            label="Reason for visit"
            value={draft.reason}
            onChange={(value) => setDraft((prev) => ({ ...prev, reason: value }))}
            placeholder="Describe symptoms or what the visit is for..."
            rows={3}
          />
        </div>
        {!isOwnerBooking ? (
          <div className="mt-4">
            <FormTextArea
              label="Extra notes"
              value={draft.notes}
              onChange={(value) => setDraft((prev) => ({ ...prev, notes: value }))}
              placeholder="Anything the clinic should know before the visit..."
              rows={3}
            />
          </div>
        ) : null}
        <FormErrorMessage message={error} />
        <FormActions
          onCancel={onClose}
          submitLabel={appointment ? 'Save appointment' : 'Create appointment'}
          submittingLabel="Saving..."
          loading={loading}
        />
      </form>
    </FormDialog>
  );
}

function buildMedicalRecordDraft(record?: MedicalRecordResponse | null) {
  return {
    symptoms: record?.symptoms ?? '',
    diagnosis: record?.diagnosis ?? '',
    treatment: record?.treatment ?? '',
    recommendations: record?.recommendations ?? '',
  };
}

function MedicalRecordEditor({
  record,
  appointmentId,
  loading,
  error,
  onSave,
  onComplete,
}: Readonly<{
  record?: MedicalRecordResponse | null;
  appointmentId: string;
  loading: boolean;
  error: string | null;
  onSave: (body: CreateMedicalRecordRequest | UpdateMedicalRecordRequest) => Promise<void>;
  onComplete: (body: CreateMedicalRecordRequest | UpdateMedicalRecordRequest) => Promise<void>;
}>) {
  const [draft, setDraft] = useState(() => buildMedicalRecordDraft(record));

  useEffect(() => {
    setDraft(buildMedicalRecordDraft(record));
  }, [record]);

  const payload = {
    appointmentId,
    symptoms: draft.symptoms.trim() || null,
    diagnosis: draft.diagnosis.trim() || null,
    treatment: draft.treatment.trim() || null,
    recommendations: draft.recommendations.trim() || null,
  };

  return (
    <Surface className="p-5">
      <SectionHeader
        title="Clinical note"
        description="Write symptoms, diagnosis, treatment and recommendations directly against the appointment."
      />
      <div className="grid gap-4">
        <FormTextArea label="Symptoms" value={draft.symptoms} onChange={(value) => setDraft((prev) => ({ ...prev, symptoms: value }))} />
        <FormTextArea label="Diagnosis" value={draft.diagnosis} onChange={(value) => setDraft((prev) => ({ ...prev, diagnosis: value }))} />
        <FormTextArea label="Treatment" value={draft.treatment} onChange={(value) => setDraft((prev) => ({ ...prev, treatment: value }))} />
        <FormTextArea label="Recommendations" value={draft.recommendations} onChange={(value) => setDraft((prev) => ({ ...prev, recommendations: value }))} />
      </div>
      <FormErrorMessage message={error} />
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton
          variant="secondary"
          icon={Save}
          disabled={loading}
          onClick={() => void onSave(payload)}
        >
          {record ? 'Update note' : 'Save note'}
        </PrimaryButton>
        <PrimaryButton icon={CheckCircle2} disabled={loading} onClick={() => void onComplete(payload)}>
          Complete visit
        </PrimaryButton>
      </div>
    </Surface>
  );
}

function AdminAccountDialog({
  open,
  loading,
  error,
  onClose,
  onSubmit,
}: Readonly<{
  open: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (body: CreateAdminRequest) => Promise<void>;
}>) {
  const [draft, setDraft] = useState<CreateAdminRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setDraft({ email: '', password: '', firstName: '', lastName: '' });
      setFieldErrors({});
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const firstNameError = validateName(draft.firstName, 'First name');
    const lastNameError = validateName(draft.lastName, 'Last name');
    const emailError = validateEmail(draft.email);
    const passwordError = validatePassword(draft.password);
    if (firstNameError) nextErrors.firstName = firstNameError;
    if (lastNameError) nextErrors.lastName = lastNameError;
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit({
      email: draft.email.trim(),
      password: draft.password,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
    });
  };

  return (
    <FormDialog
      open={open}
      title="Create admin account"
      description="Create a new clinic administrator account directly from the super admin panel."
      onClose={onClose}
      widthClassName="max-w-2xl"
    >
      <form onSubmit={handleSubmit}>
        <FormGrid columns={2}>
          <FormField label="First name" value={draft.firstName} onChange={(value) => setDraft((prev) => ({ ...prev, firstName: value }))} error={fieldErrors.firstName} />
          <FormField label="Last name" value={draft.lastName} onChange={(value) => setDraft((prev) => ({ ...prev, lastName: value }))} error={fieldErrors.lastName} />
          <FormField label="Email" type="email" value={draft.email} onChange={(value) => setDraft((prev) => ({ ...prev, email: value }))} error={fieldErrors.email} />
          <FormField label="Password" type="password" value={draft.password} onChange={(value) => setDraft((prev) => ({ ...prev, password: value }))} error={fieldErrors.password} />
        </FormGrid>
        <FormErrorMessage message={error} />
        <FormActions onCancel={onClose} submitLabel="Create admin" submittingLabel="Creating..." loading={loading} />
      </form>
    </FormDialog>
  );
}

function DoctorAccountDialog({
  open,
  doctor,
  specializationOptions,
  loading,
  error,
  onClose,
  onCreate,
  onUpdate,
}: Readonly<{
  open: boolean;
  doctor?: DoctorResponse | null;
  specializationOptions: SelectOption[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onCreate: (body: CreateDoctorStaffRequest) => Promise<void>;
  onUpdate: (body: { firstName: string; lastName: string; bio: string; isActive: boolean; specializationIds: string[] }) => Promise<void>;
}>) {
  const [draft, setDraft] = useState({
    email: doctor?.email ?? '',
    password: '',
    firstName: doctor?.firstName ?? '',
    lastName: doctor?.lastName ?? '',
    bio: doctor?.bio ?? '',
    isActive: doctor?.isActive ?? true,
    specializationIds: doctor?.specializations.map((item) => item.id) ?? [],
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setDraft({
        email: doctor?.email ?? '',
        password: '',
        firstName: doctor?.firstName ?? '',
        lastName: doctor?.lastName ?? '',
        bio: doctor?.bio ?? '',
        isActive: doctor?.isActive ?? true,
        specializationIds: doctor?.specializations.map((item) => item.id) ?? [],
      });
      setFieldErrors({});
    }
  }, [doctor, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const firstNameError = validateName(draft.firstName, 'First name');
    const lastNameError = validateName(draft.lastName, 'Last name');
    if (firstNameError) nextErrors.firstName = firstNameError;
    if (lastNameError) nextErrors.lastName = lastNameError;
    if (!doctor) {
      const emailError = validateEmail(draft.email);
      const passwordError = validatePassword(draft.password);
      if (emailError) nextErrors.email = emailError;
      if (passwordError) nextErrors.password = passwordError;
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (doctor) {
      await onUpdate({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        bio: draft.bio.trim(),
        isActive: draft.isActive,
        specializationIds: draft.specializationIds,
      });
      return;
    }

    await onCreate({
      email: draft.email.trim(),
      password: draft.password,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      bio: draft.bio.trim() || null,
      specializationIds: draft.specializationIds,
    });
  };

  return (
    <FormDialog
      open={open}
      title={doctor ? 'Edit doctor' : 'Add doctor'}
      description="Manage doctor account data and specializations without leaving the admin workspace."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <FormGrid columns={2}>
          {!doctor ? (
            <>
              <FormField label="Email" type="email" value={draft.email} onChange={(value) => setDraft((prev) => ({ ...prev, email: value }))} error={fieldErrors.email} />
              <FormField label="Password" type="password" value={draft.password} onChange={(value) => setDraft((prev) => ({ ...prev, password: value }))} error={fieldErrors.password} />
            </>
          ) : null}
          <FormField label="First name" value={draft.firstName} onChange={(value) => setDraft((prev) => ({ ...prev, firstName: value }))} error={fieldErrors.firstName} />
          <FormField label="Last name" value={draft.lastName} onChange={(value) => setDraft((prev) => ({ ...prev, lastName: value }))} error={fieldErrors.lastName} />
        </FormGrid>
        <div className="mt-4">
          <FormTextArea label="Bio" value={draft.bio} onChange={(value) => setDraft((prev) => ({ ...prev, bio: value }))} placeholder="Short clinic bio..." rows={3} />
        </div>
        <div className="mt-4">
          <FormCheckboxList
            label="Specializations"
            options={specializationOptions}
            selectedValues={draft.specializationIds}
            onToggle={(value) => setDraft((prev) => ({ ...prev, specializationIds: toggleSelection(prev.specializationIds, value) }))}
          />
        </div>
        <div className="mt-4">
          <FormSwitchRow label="Doctor is active" checked={draft.isActive} onChange={(checked) => setDraft((prev) => ({ ...prev, isActive: checked }))} />
        </div>
        <FormErrorMessage message={error} />
        <FormActions onCancel={onClose} submitLabel={doctor ? 'Save doctor' : 'Create doctor'} submittingLabel="Saving..." loading={loading} />
      </form>
    </FormDialog>
  );
}

function ClinicSettingsEditor({
  settings,
  loading,
  error,
  onSubmit,
}: Readonly<{
  settings: ClinicSettingsResponse;
  loading: boolean;
  error: string | null;
  onSubmit: (body: {
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    description: string;
    workingHours: UpsertClinicWorkingHourRequest[];
  }) => Promise<void>;
}>) {
  const [draft, setDraft] = useState({
    name: settings.name,
    address: settings.address,
    phoneNumber: settings.phoneNumber,
    email: settings.email,
    description: settings.description ?? '',
    workingHours: settings.workingHours,
  });

  useEffect(() => {
    setDraft({
      name: settings.name,
      address: settings.address,
      phoneNumber: settings.phoneNumber,
      email: settings.email,
      description: settings.description ?? '',
      workingHours: settings.workingHours,
    });
  }, [settings]);

  const workingHours = draft.workingHours.length
    ? draft.workingHours
    : DAY_NAMES.map((_, index) => ({
        id: String(index),
        dayOfWeek: index,
        openTime: '09:00',
        closeTime: '18:00',
        isWorkingDay: index !== 0,
      })) satisfies ClinicWorkingHourResponse[];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit({
          name: draft.name.trim(),
          address: draft.address.trim(),
          phoneNumber: draft.phoneNumber.trim(),
          email: draft.email.trim(),
          description: draft.description.trim(),
          workingHours: workingHours.map((hour) => ({
            dayOfWeek: hour.dayOfWeek,
            openTime: timeValue(hour.openTime),
            closeTime: timeValue(hour.closeTime),
            isWorkingDay: hour.isWorkingDay,
          })),
        });
      }}
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="Clinic information" />
            <FormGrid columns={2}>
              <FormField label="Clinic name" value={draft.name} onChange={(value) => setDraft((prev) => ({ ...prev, name: value }))} />
              <FormField label="Address" value={draft.address} onChange={(value) => setDraft((prev) => ({ ...prev, address: value }))} />
              <FormField label="Phone number" value={draft.phoneNumber} onChange={(value) => setDraft((prev) => ({ ...prev, phoneNumber: value }))} />
              <FormField label="Email" type="email" value={draft.email} onChange={(value) => setDraft((prev) => ({ ...prev, email: value }))} />
            </FormGrid>
            <div className="mt-4">
              <FormTextArea label="Description" value={draft.description} onChange={(value) => setDraft((prev) => ({ ...prev, description: value }))} rows={3} />
            </div>
          </Surface>
          <Surface className="p-5">
            <SectionHeader title="Working hours" description="Clinic-level availability by weekday." />
            <div className="grid gap-3">
              {workingHours.map((hour) => (
                <div key={hour.dayOfWeek} className="grid items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:grid-cols-[1fr_140px_140px_90px]">
                  <p className="font-black text-slate-100">{DAY_NAMES[hour.dayOfWeek]}</p>
                  <input
                    value={timeValue(hour.openTime)}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        workingHours: workingHours.map((item) =>
                          item.dayOfWeek === hour.dayOfWeek ? { ...item, openTime: event.target.value } : item,
                        ),
                      }))
                    }
                    type="time"
                    disabled={!hour.isWorkingDay}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 disabled:opacity-40"
                  />
                  <input
                    value={timeValue(hour.closeTime)}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        workingHours: workingHours.map((item) =>
                          item.dayOfWeek === hour.dayOfWeek ? { ...item, closeTime: event.target.value } : item,
                        ),
                      }))
                    }
                    type="time"
                    disabled={!hour.isWorkingDay}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 disabled:opacity-40"
                  />
                  <label className="flex items-center justify-center gap-2 text-sm font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={hour.isWorkingDay}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          workingHours: workingHours.map((item) =>
                            item.dayOfWeek === hour.dayOfWeek ? { ...item, isWorkingDay: event.target.checked } : item,
                          ),
                        }))
                      }
                      className="h-4 w-4 accent-teal-500"
                    />
                    Open
                  </label>
                </div>
              ))}
            </div>
          </Surface>
        </div>
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="Branding" description="Logo upload is not available in the current API, but the rest of clinic settings are live." />
            <div className="rounded-[1.6rem] border border-dashed border-teal-200 bg-teal-50 p-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-teal-600" />
              <p className="mt-3 font-black text-teal-900">Branding stays read-only</p>
              <p className="mt-1 text-sm text-teal-700">No backend asset endpoint was found during the API audit.</p>
            </div>
          </Surface>
          <MetricCard label="Default duration" value="Service based" caption="Derived from service setup" icon={Clock3} tone="amber" />
          <FormErrorMessage message={error} />
          <PrimaryButton type="submit" icon={Save} disabled={loading}>
            {loading ? 'Saving settings...' : 'Save settings'}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}

export function RedesignedOwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const petsState = useOwnerPets();
  const appointmentsState = useOwnerAppointments();
  const vaccinationsState = useOwnerVaccinations();
  const petIds = petsState.data.map((p) => p.id);
  const recordsState = useOwnerMedicalRecords(petIds);

  const ownerPets = petsState.data.map((p) => mapPet(p));
  const ownerAppointments = appointmentsState.data.map(mapAppointment);
  const upcomingOwner = ownerAppointments.filter((a) => a.status === 'Scheduled');
  const records = recordsState.data.slice(0, 3).map(mapMedicalRecord);
  const vaccines = vaccinationsState.data.slice(0, 4).map(mapVaccination);
  const ownerGreeting = ownerPets[0]?.name
    ? `${ownerPets[0].name}'s visit may be coming up.`
    : 'Welcome back.';

  return (
    <DataState loading={petsState.loading || appointmentsState.loading} error={petsState.error ?? appointmentsState.error}>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client home"
        title={`Good morning, ${user?.firstName ?? 'there'}. ${ownerGreeting}`}
        description="A warm overview focused on care tasks, appointments, pet status, and reminders — no heavy analytics here."
        icon={PawPrint}
        actions={<PrimaryButton icon={Plus} onClick={() => navigate('/client/appointments')}>Book appointment</PrimaryButton>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="Next appointment" description="The most important care event is always surfaced first." action={<PrimaryButton variant="secondary" icon={Calendar} onClick={() => navigate('/client/appointments')}>Manage</PrimaryButton>} />
            {upcomingOwner[0] ? <AppointmentCard appointment={upcomingOwner[0]} /> : <EmptyState title="No appointment yet" description="Book a visit and it will appear here." />}
          </Surface>
          <div className="grid gap-4 md:grid-cols-3">
            {ownerPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onOpen={() => navigate(`/client/pets/${pet.id}`)} onBook={() => navigate('/client/appointments')} />
            ))}
          </div>
          <Surface className="p-5">
            <SectionHeader title="Recent medical updates" description="Clinical history as a readable care timeline." action={<button onClick={() => navigate('/client/medical-history')} className="text-sm font-bold text-teal-700">View all</button>} />
            <MedicalTimeline records={records} />
          </Surface>
        </div>
        <div className="space-y-5">
          <MetricCard label="Pets in care" value={ownerPets.length} caption="Family profiles" icon={PawPrint} tone="teal" />
          <MetricCard label="Upcoming" value={upcomingOwner.length} caption="Scheduled visits" icon={Calendar} tone="blue" />
          <Surface className="p-5">
            <SectionHeader title="Care reminders" />
            <div className="space-y-3">
              {vaccines.map((vaccine) => (
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
    </DataState>
  );
}

export function RedesignedMyPets() {
  const navigate = useNavigate();
  const petsState = useOwnerPets();
  const currentUserState = useCurrentUserProfile();
  const ownerPets = petsState.data.map((p) => mapPet(p));
  const [editingPet, setEditingPet] = useState<PetResponse | null>(null);
  const [petDialogOpen, setPetDialogOpen] = useState(false);
  const [savingPet, setSavingPet] = useState(false);
  const [petError, setPetError] = useState<string | null>(null);

  const openCreatePet = () => {
    setEditingPet(null);
    setPetError(null);
    setPetDialogOpen(true);
  };

  const openEditPet = (petId: string) => {
    const target = petsState.data.find((item) => item.id === petId) ?? null;
    setEditingPet(target);
    setPetError(null);
    setPetDialogOpen(true);
  };

  const handleSavePet = async (body: Omit<UpsertPetRequest, 'ownerId'>) => {
    const ownerId = editingPet?.ownerId ?? currentUserState.data.profileId;
    if (!ownerId) {
      setPetError('Owner profile is missing. Please sign out and sign in again.');
      return;
    }

    setSavingPet(true);
    setPetError(null);
    try {
      const payload: UpsertPetRequest = { ...body, ownerId };
      if (editingPet) {
        await petsApi.update(editingPet.id, payload);
      } else {
        await petsApi.createMine(payload);
      }
      setPetDialogOpen(false);
      petsState.reload();
    } catch (error) {
      setPetError(formatApiError(error, 'Could not save the pet profile.'));
      throw error;
    } finally {
      setSavingPet(false);
    }
  };

  return (
    <DataState loading={petsState.loading} error={petsState.error}>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pet profiles"
        title="Every pet gets a richer identity card."
        description="Photos, health state, species context, last visit, and quick booking live together without becoming a table."
        icon={PawPrint}
        actions={<PrimaryButton icon={Plus} onClick={openCreatePet}>Add pet</PrimaryButton>}
      />
      <FilterBar filters={['All pets', 'Healthy', 'Needs attention', 'Under treatment']} searchPlaceholder="Search pets by name, species, breed..." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ownerPets.map((pet) => (
          <div key={pet.id} className="space-y-3">
            <PetCard pet={pet} onOpen={() => navigate(`/client/pets/${pet.id}`)} onBook={() => navigate('/client/appointments')} />
            <PrimaryButton variant="secondary" icon={Edit3} onClick={() => openEditPet(pet.id)}>
              Edit profile
            </PrimaryButton>
          </div>
        ))}
      </div>
      {!ownerPets.length ? (
        <EmptyState
          title="No pet profiles yet"
          description="Create the first pet profile and it will immediately appear in your care dashboard."
          action={<PrimaryButton icon={Plus} onClick={openCreatePet}>Add first pet</PrimaryButton>}
        />
      ) : null}
    </div>
    <PetFormDialog
      open={petDialogOpen}
      pet={editingPet}
      loading={savingPet}
      error={petError}
      onClose={() => setPetDialogOpen(false)}
      onSubmit={handleSavePet}
    />
    </DataState>
  );
}

export function RedesignedPetProfile() {
  const navigate = useNavigate();
  const params = useParams();
  const petsState = useOwnerPets();
  const currentUserState = useCurrentUserProfile();
  const ownerPets = petsState.data.map((p) => mapPet(p));
  const petId = params.id ?? ownerPets[0]?.id;
  const petState = usePetById(petId, petsState.data);
  const petRaw = petState.data ?? petsState.data[0];
  const pet = petRaw ? mapPet(petRaw) : ownerPets[0];
  const recordsState = usePetMedicalRecords(petRaw?.id);
  const appointmentsState = useOwnerAppointments();
  const vaccinesState = usePetVaccinations(petRaw?.id);
  const records = recordsState.data.map(mapMedicalRecord);
  const petAppointments = appointmentsState.data.filter((a) => a.petId === petRaw?.id).map(mapAppointment);
  const petVaccines = vaccinesState.data.map(mapVaccination);
  const [editingPet, setEditingPet] = useState(false);
  const [savingPet, setSavingPet] = useState(false);
  const [petError, setPetError] = useState<string | null>(null);

  if (!pet) {
    return <EmptyState title="Pet not found" description="This pet profile is unavailable." />;
  }

  const handleSavePet = async (body: Omit<UpsertPetRequest, 'ownerId'>) => {
    if (!petRaw) return;
    const ownerId = petRaw.ownerId ?? currentUserState.data.profileId;
    if (!ownerId) {
      setPetError('Owner profile is missing. Please sign out and sign in again.');
      return;
    }

    setSavingPet(true);
    setPetError(null);
    try {
      await petsApi.update(petRaw.id, { ...body, ownerId });
      setEditingPet(false);
      petsState.reload();
      petState.reload();
    } catch (error) {
      setPetError(formatApiError(error, 'Could not update the pet profile.'));
      throw error;
    } finally {
      setSavingPet(false);
    }
  };

  return (
    <DataState loading={petsState.loading || petState.loading} error={petsState.error ?? petState.error}>
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
            <PrimaryButton variant="ghost" icon={Edit3} onClick={() => setEditingPet(true)}>Edit pet</PrimaryButton>
            <PrimaryButton variant="secondary" icon={FileText} onClick={() => navigate('/client/medical-history')}>Medical timeline</PrimaryButton>
            <PrimaryButton icon={Calendar} onClick={() => navigate('/client/appointments')}>Book visit</PrimaryButton>
          </div>
        </div>
      </Surface>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Surface className="p-5">
          <SectionHeader title="Medical timeline" description="Visits, diagnoses, treatments and follow-up notes." />
          <MedicalTimeline records={records.length ? records : []} />
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
              {petVaccines.map((vaccine) => (
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
    <PetFormDialog
      open={editingPet}
      pet={petRaw}
      loading={savingPet}
      error={petError}
      onClose={() => setEditingPet(false)}
      onSubmit={handleSavePet}
    />
    </DataState>
  );
}

export function RedesignedOwnerAppointments() {
  const appointmentsState = useOwnerAppointments();
  const petsState = useOwnerPets();
  const doctorsState = useDoctors(false);
  const servicesState = useServices();
  const { cancel, busyId } = useAppointmentActions(() => appointmentsState.reload());
  const ownerAppointments = appointmentsState.data.map(mapAppointment);
  const bookableDoctors = doctorsState.data.filter((doctor) => doctor.isActive);
  const bookingReady = !petsState.loading && !doctorsState.loading && !servicesState.loading;
  const bookingErrorMessage =
    petsState.error ?? doctorsState.error ?? servicesState.error ?? null;
  const [bookingOpen, setBookingOpen] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const openBooking = () => {
    if (!petsState.data.length) {
      setBookingError('Add at least one pet before booking a visit.');
      return;
    }
    if (!bookableDoctors.length) {
      setBookingError('No doctors are available for online booking right now.');
      return;
    }
    setBookingError(null);
    setBookingOpen(true);
  };

  const handleCreateAppointment = async (body: CreateAppointmentRequest | UpdateAppointmentRequest) => {
    setSavingBooking(true);
    setBookingError(null);
    try {
      await appointmentsApi.create(body as CreateAppointmentRequest);
      setBookingOpen(false);
      appointmentsState.reload();
    } catch (error) {
      setBookingError(formatApiError(error, 'Could not create the appointment.'));
    } finally {
      setSavingBooking(false);
    }
  };

  return (
    <DataState
      loading={appointmentsState.loading || petsState.loading || doctorsState.loading || servicesState.loading}
      error={appointmentsState.error ?? bookingErrorMessage}
    >
    <div className="space-y-6">
      <PageHeader eyebrow="Appointments" title="Book, review, and cancel visits." description="Workflow-focused appointment management for pet owners, with no distracting charts." icon={Calendar} actions={<PrimaryButton icon={Plus} disabled={!bookingReady} onClick={openBooking}>New booking</PrimaryButton>} />
      <FilterBar filters={['All', 'Scheduled', 'Completed', 'Cancelled']} searchPlaceholder="Search appointment, pet, doctor..." />
      <div className="grid gap-4">
        {ownerAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            actions={
              appointment.status === 'Scheduled' ? (
                <PrimaryButton variant="secondary" disabled={busyId === appointment.id} onClick={() => cancel(appointment.id, 'Cancelled by owner')}>
                  Cancel visit
                </PrimaryButton>
              ) : undefined
            }
          />
        ))}
      </div>
      {!ownerAppointments.length ? (
        <EmptyState
          title="No appointments yet"
          description="Book the first visit for one of your pets and it will show up in this timeline."
          action={<PrimaryButton icon={Plus} disabled={!bookingReady} onClick={openBooking}>Book appointment</PrimaryButton>}
        />
      ) : null}
    </div>
    <AppointmentFormDialog
      open={bookingOpen}
      title="Book appointment"
      description="Choose your pet, service, doctor and the visit start time."
      variant="owner"
      pets={petsState.data.map((pet) => ({ id: pet.id, name: pet.name }))}
      doctors={doctorsState.data}
      rooms={[]}
      services={servicesState.data.map((service) => ({
        id: service.id,
        name: service.name,
        durationMinutes: service.durationMinutes,
      }))}
      loading={savingBooking}
      error={bookingError}
      onClose={() => setBookingOpen(false)}
      onSubmit={handleCreateAppointment}
    />
    </DataState>
  );
}

export function RedesignedOwnerMedicalHistory() {
  const petsState = useOwnerPets();
  const petIds = petsState.data.map((p) => p.id);
  const recordsState = useOwnerMedicalRecords(petIds);
  const records = recordsState.data.map(mapMedicalRecord);

  return (
    <DataState loading={recordsState.loading} error={recordsState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Medical history" title="A calm clinical timeline for every pet." description="Readable medical records, diagnoses, prescriptions, vaccinations, and follow-ups." icon={FileText} />
      <FilterBar filters={['All pets', 'Vaccinations', 'Treatments']} searchPlaceholder="Search diagnosis, doctor, pet..." />
      <Surface className="p-5">
        <MedicalTimeline records={records} />
      </Surface>
    </div>
    </DataState>
  );
}

export function RedesignedDoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const appointmentsState = useDoctorAppointments();
  const doctorAppointments = appointmentsState.data.map(mapAppointment);
  const quickPets = doctorAppointments.slice(0, 4).map((a) => ({
    id: a.petId,
    name: a.petName,
    species: a.petSpecies,
    breed: a.service,
  }));
  const nextNoteAppointment = appointmentsState.data.find((item) => item.status === 'Scheduled') ?? appointmentsState.data[0];

  return (
    <DataState loading={appointmentsState.loading} error={appointmentsState.error}>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Doctor today"
        title={`Focused clinical day for Dr. ${user?.lastName ?? 'Carter'}.`}
        description="Schedule, next appointment, pending notes, and patient access — without overloaded analytics."
        icon={Stethoscope}
        actions={
          <PrimaryButton
            icon={FileText}
            disabled={!nextNoteAppointment}
            onClick={() => nextNoteAppointment && navigate(`/doctor/notes/${nextNoteAppointment.id}`)}
          >
            Open next note
          </PrimaryButton>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="Today's schedule" action={<PrimaryButton variant="secondary" icon={Calendar} onClick={() => navigate('/doctor/schedule')}>Full schedule</PrimaryButton>} />
            <div className="space-y-3">
              {doctorAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  actions={<PrimaryButton variant="secondary" icon={FileText} onClick={() => navigate(`/doctor/notes/${appointment.id}`)}>Open note</PrimaryButton>}
                />
              ))}
            </div>
          </Surface>
          <Surface className="p-5">
            <SectionHeader title="Pending clinical notes" />
            <div className="grid gap-3 md:grid-cols-2">
              {doctorAppointments.slice(0, 4).map((appointment) => (
                <button key={appointment.id} type="button" onClick={() => navigate(`/doctor/notes/${appointment.id}`)} className="text-left">
                  <InsightItem icon={FileText} tone={appointment.status === 'In progress' ? 'amber' : 'teal'} title={`${appointment.petName} · ${appointment.service}`} description="Open the live appointment note and complete the backend medical record." />
                </button>
              ))}
            </div>
          </Surface>
        </div>
        <div className="space-y-5">
          <MetricCard label="Next visit" value={doctorAppointments[0]?.time ?? '—'} caption={doctorAppointments[0] ? `${doctorAppointments[0].petName}` : 'No visits'} icon={Clock3} tone="teal" />
          <MetricCard label="Notes due" value={doctorAppointments.filter((a) => a.status === 'Scheduled').length} caption="Before end of day" icon={FileText} tone="amber" />
          <Surface className="p-5">
            <SectionHeader title="Patient quick access" />
            <div className="space-y-3">
              {quickPets.map((pet) => (
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
    </DataState>
  );
}

export function RedesignedDoctorSchedule() {
  const appointmentsState = useDoctorAppointments();
  const doctorAppointments = appointmentsState.data.map(mapAppointment);

  return (
    <DataState loading={appointmentsState.loading} error={appointmentsState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Schedule" title="A visual day plan for real clinical work." description="Timeline blocks, appointment context, quick actions, and a mobile agenda fallback." icon={Calendar} />
      <FilterBar filters={['Today', 'Week', 'Month', 'Scheduled', 'In progress']} searchPlaceholder="Search schedule..." />
      <CalendarGrid appointments={doctorAppointments} />
    </div>
    </DataState>
  );
}

export function RedesignedDoctorAppointments() {
  const appointmentsState = useDoctorAppointments();
  const navigate = useNavigate();
  const { complete, busyId } = useAppointmentActions(() => appointmentsState.reload());
  const doctorAppointments = appointmentsState.data.map(mapAppointment);

  return (
    <DataState loading={appointmentsState.loading} error={appointmentsState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Doctor appointments" title="Clinical queue with patient and owner context." description="Time, reason, status, and actions remain visible without table fatigue." icon={ClipboardIcon} />
      <FilterBar filters={['All', 'Today', 'Scheduled', 'In progress', 'Completed']} searchPlaceholder="Search patient, owner, reason..." />
      <div className="grid gap-4">
        {doctorAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            actions={
              <>
                <PrimaryButton variant="secondary" icon={FileText} onClick={() => navigate(`/doctor/notes/${appointment.id}`)}>
                  Open note
                </PrimaryButton>
                {appointment.status === 'Scheduled' ? (
                  <PrimaryButton disabled={busyId === appointment.id} onClick={() => complete(appointment.id)}>
                    Complete
                  </PrimaryButton>
                ) : null}
              </>
            }
          />
        ))}
      </div>
    </div>
    </DataState>
  );
}

function ClipboardIcon(props: SVGProps<SVGSVGElement>) {
  return <FileText {...props} />;
}

export function RedesignedMedicalNotes() {
  const params = useParams();
  const appointmentsState = useDoctorAppointments();
  const appointment = appointmentsState.data.find((item) => item.id === params.id);
  const appointmentView = appointment ? mapAppointment(appointment) : null;
  const recordState = useMedicalRecordByAppointment(params.id);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!params.id) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Medical notes" title="Clinical documentation that feels structured, not cramped." description="Medical notes open from a specific backend appointment and save straight into the medical record." icon={HeartPulse} />
        <EmptyState
          title="Select a real appointment"
          description="Open a medical note from a live appointment to create or update the clinical record."
        />
      </div>
    );
  }

  const handleSave = async (body: CreateMedicalRecordRequest | UpdateMedicalRecordRequest) => {
    setSaving(true);
    setActionError(null);
    try {
      if (recordState.data) {
        await medicalRecordsApi.update(recordState.data.id, body as UpdateMedicalRecordRequest);
      } else {
        await medicalRecordsApi.create(body as CreateMedicalRecordRequest);
      }
      recordState.reload();
      appointmentsState.reload();
    } catch (error) {
      setActionError(formatApiError(error, 'Could not save the medical note.'));
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (body: CreateMedicalRecordRequest | UpdateMedicalRecordRequest) => {
    setSaving(true);
    setActionError(null);
    try {
      if (recordState.data) {
        await medicalRecordsApi.update(recordState.data.id, body as UpdateMedicalRecordRequest);
      } else {
        await medicalRecordsApi.create(body as CreateMedicalRecordRequest);
      }
      await appointmentsApi.complete(params.id);
      recordState.reload();
      appointmentsState.reload();
    } catch (error) {
      setActionError(formatApiError(error, 'Could not complete the visit.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DataState loading={appointmentsState.loading || recordState.loading} error={appointmentsState.error ?? recordState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Medical notes" title="Clinical documentation that feels structured, not cramped." description="Patient context stays visible while the doctor writes symptoms, diagnosis, treatment, prescription and follow-up." icon={HeartPulse} />
      {appointmentView ? (
        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <Surface className="p-5">
            <SectionHeader title="Appointment context" description="Live appointment data linked to the active backend medical record." />
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Patient</p>
                <p className="mt-1 font-black text-slate-950">{appointmentView.petName}</p>
                <p className="text-sm text-slate-500">{appointmentView.petSpecies}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Visit</p>
                <p className="mt-1 font-black text-slate-950">{appointmentView.service}</p>
                <p className="text-sm text-slate-500">{appointmentView.date} at {appointmentView.time}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Doctor</p>
                <p className="mt-1 font-black text-slate-950">{appointmentView.doctorName}</p>
                <p className="text-sm text-slate-500">{appointmentView.status}</p>
              </div>
              {appointmentView.notes ? (
                <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />
                  <span>{appointmentView.notes}</span>
                </div>
              ) : null}
            </div>
          </Surface>
          <MedicalRecordEditor
            record={recordState.data}
            appointmentId={params.id}
            loading={saving}
            error={actionError}
            onSave={handleSave}
            onComplete={handleComplete}
          />
        </div>
      ) : (
        <EmptyState
          title="Appointment not found"
          description="This medical note route expects a real appointment id from the backend. The selected appointment is unavailable."
        />
      )}
    </div>
    </DataState>
  );
}

export function RedesignedAdminDashboard() {
  const appointmentsState = useAdminAppointments();
  const petsState = useAllPets();
  const doctorsState = useDoctors(true);
  const servicesState = useServices();
  const roomsState = useRooms();
  const allAppointments = appointmentsState.data.map(mapAppointment);
  const todayKey = new Date().toDateString();
  const todayAppointments = allAppointments.filter((a) => new Date(a.date).toDateString() === todayKey || a.status === 'Scheduled');
  const doctorViews = doctorsState.data.map((d) => mapDoctor(d, allAppointments.filter((a) => a.doctorId === d.id).length));
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreateAppointment = async (body: CreateAppointmentRequest | UpdateAppointmentRequest) => {
    setSaving(true);
    setActionError(null);
    try {
      await appointmentsApi.create(body as CreateAppointmentRequest);
      setCreateOpen(false);
      appointmentsState.reload();
    } catch (error) {
      setActionError(formatApiError(error, 'Could not create the appointment.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DataState loading={appointmentsState.loading || doctorsState.loading || petsState.loading || servicesState.loading || roomsState.loading} error={appointmentsState.error ?? doctorsState.error ?? petsState.error ?? servicesState.error ?? roomsState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Clinic operations" title="Today’s clinic pulse, without analytics overload." description="Operational status, urgent items, doctor availability, and quick actions live here. Trends moved to Insights." icon={ShieldCheck} actions={<PrimaryButton icon={Plus} onClick={() => setCreateOpen(true)}>Create appointment</PrimaryButton>} />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Visits today" value={todayAppointments.length} caption="Across all rooms" icon={Calendar} tone="teal" />
        <MetricCard label="Doctors active" value={doctorViews.filter((doctor) => doctor.status !== 'Off duty').length} caption="Ready for visits" icon={Stethoscope} tone="blue" />
        <MetricCard label="Scheduled" value={allAppointments.filter((a) => a.status === 'Scheduled').length} caption="Upcoming visits" icon={AlertCircle} tone="amber" />
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
              {doctorViews.map((doctor) => (
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
        </div>
      </div>
    </div>
    <AppointmentFormDialog
      open={createOpen}
      title="Create appointment"
      description="Create a clinic visit from the admin dashboard."
      pets={petsState.data.map((pet) => ({ id: pet.id, name: pet.name, ownerName: pet.ownerFullName }))}
      doctors={doctorsState.data}
      rooms={roomsState.data.map((room) => ({ id: room.id, name: room.name }))}
      services={servicesState.data.map((service) => ({ id: service.id, name: service.name, durationMinutes: service.durationMinutes }))}
      loading={saving}
      error={actionError}
      onClose={() => setCreateOpen(false)}
      onSubmit={handleCreateAppointment}
    />
    </DataState>
  );
}

export function RedesignedClinicCalendar() {
  const appointmentsState = useAdminAppointments();
  const petsState = useAllPets();
  const doctorsState = useDoctors(true);
  const servicesState = useServices();
  const roomsState = useRooms();
  const allAppointments = appointmentsState.data.map(mapAppointment);
  const todayAppointments = allAppointments.slice(0, 8);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreateAppointment = async (body: CreateAppointmentRequest | UpdateAppointmentRequest) => {
    setSaving(true);
    setActionError(null);
    try {
      await appointmentsApi.create(body as CreateAppointmentRequest);
      setCreateOpen(false);
      appointmentsState.reload();
    } catch (error) {
      setActionError(formatApiError(error, 'Could not create the appointment.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DataState loading={appointmentsState.loading || petsState.loading || doctorsState.loading || servicesState.loading || roomsState.loading} error={appointmentsState.error ?? petsState.error ?? doctorsState.error ?? servicesState.error ?? roomsState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Clinic calendar" title="Multi-doctor, multi-room calendar for real clinic operations." description="Day/week/month controls, doctor filters, room filters, status filters, overlapping appointment blocks, and mobile agenda mode." icon={Calendar} actions={<PrimaryButton icon={Plus} onClick={() => setCreateOpen(true)}>New appointment</PrimaryButton>} />
      <FilterBar filters={['Day', 'Week', 'Month', 'Scheduled', 'In progress']} searchPlaceholder="Search calendar appointments..." />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <CalendarGrid appointments={todayAppointments} />
        <Surface className="p-5">
          <SectionHeader title="Appointment details" description="Select a block to manage the visit." />
          {todayAppointments[0] ? <AppointmentCard appointment={todayAppointments[0]} compact /> : <EmptyState title="No appointments" description="Create a visit to populate the calendar." />}
        </Surface>
      </div>
    </div>
    <AppointmentFormDialog
      open={createOpen}
      title="Create appointment"
      description="Create a new visit from the clinic calendar."
      pets={petsState.data.map((pet) => ({ id: pet.id, name: pet.name, ownerName: pet.ownerFullName }))}
      doctors={doctorsState.data}
      rooms={roomsState.data.map((room) => ({ id: room.id, name: room.name }))}
      services={servicesState.data.map((service) => ({ id: service.id, name: service.name, durationMinutes: service.durationMinutes }))}
      loading={saving}
      error={actionError}
      onClose={() => setCreateOpen(false)}
      onSubmit={handleCreateAppointment}
    />
    </DataState>
  );
}

export function RedesignedAppointmentManagement() {
  const appointmentsState = useAdminAppointments();
  const petsState = useAllPets();
  const doctorsState = useDoctors(true);
  const servicesState = useServices();
  const roomsState = useRooms();
  const { cancel, complete, busyId } = useAppointmentActions(() => appointmentsState.reload());
  const allAppointments = appointmentsState.data.map(mapAppointment);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingAppointment(null);
    setActionError(null);
    setDialogOpen(true);
  };

  const openEdit = (appointmentId: string) => {
    setEditingAppointment(appointmentsState.data.find((item) => item.id === appointmentId) ?? null);
    setActionError(null);
    setDialogOpen(true);
  };

  const handleSaveAppointment = async (body: CreateAppointmentRequest | UpdateAppointmentRequest) => {
    setSaving(true);
    setActionError(null);
    try {
      if (editingAppointment) {
        await appointmentsApi.update(editingAppointment.id, body as UpdateAppointmentRequest);
      } else {
        await appointmentsApi.create(body as CreateAppointmentRequest);
      }
      setDialogOpen(false);
      appointmentsState.reload();
    } catch (error) {
      setActionError(formatApiError(error, 'Could not save the appointment.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DataState loading={appointmentsState.loading || petsState.loading || doctorsState.loading || servicesState.loading || roomsState.loading} error={appointmentsState.error ?? petsState.error ?? doctorsState.error ?? servicesState.error ?? roomsState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Appointment management" title="A powerful queue without unnecessary charts." description="Searchable, filterable, status-aware management view with edit/cancel/complete actions." icon={Calendar} actions={<PrimaryButton icon={Plus} onClick={openCreate}>Create appointment</PrimaryButton>} />
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
              {allAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-teal-50/35">
                  <td className="px-5 py-4 font-black text-slate-950">{appointment.date}<br /><span className="text-xs text-slate-400">{appointment.time}</span></td>
                  <td className="px-5 py-4">{appointment.petName}</td>
                  <td className="px-5 py-4">{appointment.ownerName}</td>
                  <td className="px-5 py-4">{appointment.doctorName}</td>
                  <td className="px-5 py-4">{appointment.service}</td>
                  <td className="px-5 py-4"><StatusBadge status={appointment.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(appointment.id)} className="rounded-xl border border-slate-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">Edit</button>
                      {appointment.status === 'Scheduled' && (
                        <>
                          <button disabled={busyId === appointment.id} onClick={() => complete(appointment.id)} className="rounded-xl border border-slate-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">Complete</button>
                          <button disabled={busyId === appointment.id} onClick={() => cancel(appointment.id)} className="rounded-xl border border-slate-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">Cancel</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-4 lg:hidden">
          {allAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              compact
              actions={<PrimaryButton variant="secondary" icon={Edit3} onClick={() => openEdit(appointment.id)}>Edit</PrimaryButton>}
            />
          ))}
        </div>
      </Surface>
    </div>
    <AppointmentFormDialog
      open={dialogOpen}
      title={editingAppointment ? 'Edit appointment' : 'Create appointment'}
      description="Manage visit timing, room, doctor and service from the admin queue."
      appointment={editingAppointment}
      pets={petsState.data.map((pet) => ({ id: pet.id, name: pet.name, ownerName: pet.ownerFullName }))}
      doctors={doctorsState.data}
      rooms={roomsState.data.map((room) => ({ id: room.id, name: room.name }))}
      services={servicesState.data.map((service) => ({ id: service.id, name: service.name, durationMinutes: service.durationMinutes }))}
      loading={saving}
      error={actionError}
      onClose={() => setDialogOpen(false)}
      onSubmit={handleSaveAppointment}
    />
    </DataState>
  );
}

export function RedesignedDoctorManagement() {
  const { user } = useAuth();
  const doctorsState = useDoctors(true);
  const appointmentsState = useAdminAppointments();
  const specializationsState = useSpecializations(false);
  const doctorViews = doctorsState.data.map((d) =>
    mapDoctor(d, appointmentsState.data.filter((a) => a.doctorId === d.id).length),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingDoctor(null);
    setActionError(null);
    setDialogOpen(true);
  };

  const openEdit = (doctorId: string) => {
    setEditingDoctor(doctorsState.data.find((doctor) => doctor.id === doctorId) ?? null);
    setActionError(null);
    setDialogOpen(true);
  };

  const handleCreateDoctor = async (body: CreateDoctorStaffRequest) => {
    setSaving(true);
    setActionError(null);
    try {
      await staffApi.createDoctor(body);
      setDialogOpen(false);
      doctorsState.reload();
    } catch (error) {
      setActionError(formatApiError(error, 'Could not create the doctor account.'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDoctor = async (body: { firstName: string; lastName: string; bio: string; isActive: boolean; specializationIds: string[] }) => {
    if (!editingDoctor) return;
    setSaving(true);
    setActionError(null);
    try {
      await doctorsApi.update(editingDoctor.id, {
        firstName: body.firstName,
        lastName: body.lastName,
        bio: body.bio || null,
        photoUrl: editingDoctor.photoUrl ?? null,
        isActive: body.isActive,
      });

      const currentIds = new Set(editingDoctor.specializations.map((item) => item.id));
      const nextIds = new Set(body.specializationIds);
      for (const specializationId of body.specializationIds) {
        if (!currentIds.has(specializationId)) {
          await doctorsApi.assignSpecialization(editingDoctor.id, specializationId);
        }
      }
      for (const specializationId of currentIds) {
        if (!nextIds.has(specializationId)) {
          await doctorsApi.removeSpecialization(editingDoctor.id, specializationId);
        }
      }

      setDialogOpen(false);
      doctorsState.reload();
    } catch (error) {
      setActionError(formatApiError(error, 'Could not update the doctor profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!globalThis.confirm('Remove this doctor from the clinic roster?')) return;
    setSaving(true);
    setActionError(null);
    try {
      await doctorsApi.remove(doctorId);
      doctorsState.reload();
    } catch (error) {
      setActionError(formatApiError(error, 'Could not remove the doctor.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DataState loading={doctorsState.loading || specializationsState.loading} error={doctorsState.error ?? specializationsState.error}>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Doctor management"
        title="Doctor profiles with schedule previews and availability."
        description="Specialization, contact info, daily load, and edit actions are surfaced in rich cards."
        icon={Stethoscope}
        actions={canManageDoctors(user!.role) ? <PrimaryButton icon={Plus} onClick={openCreate}>Add doctor</PrimaryButton> : undefined}
      />
      <FilterBar filters={['All', 'Available', 'Busy', 'Off duty', 'Surgery', 'Dermatology']} searchPlaceholder="Search doctor, specialization..." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {doctorViews.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            actions={canManageDoctors(user!.role) ? (
              <>
                <PrimaryButton variant="secondary" icon={Edit3} onClick={() => openEdit(doctor.id)}>Edit</PrimaryButton>
                <PrimaryButton variant="ghost" icon={Trash2} disabled={saving} onClick={() => handleDeleteDoctor(doctor.id)}>Remove</PrimaryButton>
              </>
            ) : undefined}
          />
        ))}
      </div>
    </div>
    <DoctorAccountDialog
      open={dialogOpen}
      doctor={editingDoctor}
      specializationOptions={specializationsState.data.map((item) => ({ value: item.id, label: item.name }))}
      loading={saving}
      error={actionError}
      onClose={() => setDialogOpen(false)}
      onCreate={handleCreateDoctor}
      onUpdate={handleUpdateDoctor}
    />
    </DataState>
  );
}

export function RedesignedStaffManagement() {
  const { user } = useAuth();
  const staffState = useStaffMembers();
  const specializationsState = useSpecializations(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [doctorDialogOpen, setDoctorDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!canManageAdmins(user!.role)) {
    return (
      <EmptyState
        title="Staff management is restricted"
        description="Only the super admin can create admin and doctor accounts."
      />
    );
  }

  return (
    <DataState loading={staffState.loading} error={staffState.error}>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Staff"
        title="Clinic staff accounts"
        description="The super admin creates admin and doctor accounts. The super admin account cannot be deleted."
        icon={ShieldCheck}
        actions={
          <div className="flex flex-wrap gap-2">
            <PrimaryButton icon={Plus} onClick={() => setAdminDialogOpen(true)}>Add admin</PrimaryButton>
            <PrimaryButton variant="secondary" icon={Stethoscope} onClick={() => setDoctorDialogOpen(true)}>Add doctor</PrimaryButton>
          </div>
        }
      />
      <Surface className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/70">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map((head) => (
                  <th key={head} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffState.data.map((member) => {
                let role: 'superadmin' | 'admin' | 'doctor';
                if (member.role === 'SuperAdmin') {
                  role = 'superadmin';
                } else if (member.role === 'Admin') {
                  role = 'admin';
                } else {
                  role = 'doctor';
                }
                const target = {
                  userId: member.userId,
                  email: member.email,
                  firstName: member.firstName,
                  lastName: member.lastName,
                  role,
                  isProtected: member.isProtected,
                };
                const deletable = canDeleteUser(user, target);

                return (
                  <tr key={member.userId} className="hover:bg-teal-50/35">
                    <td className="px-5 py-4 font-black text-slate-950">{member.firstName} {member.lastName}</td>
                    <td className="px-5 py-4 text-slate-600">{member.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                        {roleLabel(target.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {member.isProtected ? (
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">Protected</span>
                      ) : (
                        <StatusBadge status={member.isActive ? 'Available' : 'Off duty'} />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {deletable ? (
                        <button
                          onClick={async () => {
                            if (!globalThis.confirm('Remove this staff account?')) return;
                            setSaving(true);
                            setActionError(null);
                            try {
                              await staffApi.remove(member.userId);
                              staffState.reload();
                            } catch (error) {
                              setActionError(formatApiError(error, 'Could not remove the staff account.'));
                            } finally {
                              setSaving(false);
                            }
                          }}
                          className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Cannot remove</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Surface>
    </div>
    <AdminAccountDialog
      open={adminDialogOpen}
      loading={saving}
      error={actionError}
      onClose={() => setAdminDialogOpen(false)}
      onSubmit={async (body) => {
        setSaving(true);
        setActionError(null);
        try {
          await staffApi.createAdmin(body);
          setAdminDialogOpen(false);
          staffState.reload();
        } catch (error) {
          setActionError(formatApiError(error, 'Could not create the admin account.'));
        } finally {
          setSaving(false);
        }
      }}
    />
    <DoctorAccountDialog
      open={doctorDialogOpen}
      specializationOptions={specializationsState.data.map((item) => ({ value: item.id, label: item.name }))}
      loading={saving}
      error={actionError}
      onClose={() => setDoctorDialogOpen(false)}
      onCreate={async (body) => {
        setSaving(true);
        setActionError(null);
        try {
          await staffApi.createDoctor(body);
          setDoctorDialogOpen(false);
          staffState.reload();
        } catch (error) {
          setActionError(formatApiError(error, 'Could not create the doctor account.'));
        } finally {
          setSaving(false);
        }
      }}
      onUpdate={async () => undefined}
    />
    </DataState>
  );
}

export function RedesignedClientsManagement() {
  const clientsState = useClientsDirectory();
  const clients = clientsState.data.map((c) => ({
    name: `${c.firstName} ${c.lastName}`,
    phone: c.phone ?? c.email,
    petsCount: c.petsCount,
    lastAppointment: formatDate(c.lastAppointmentAt),
  }));

  return (
    <DataState loading={clientsState.loading} error={clientsState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Clients" title="Client relationships, pets, and follow-up context." description="A polished working client directory with contact info, pet counts, last appointment, and follow-up context. New client creation currently comes from the public registration flow." icon={Users} />
      <FilterBar filters={['All clients', 'Has upcoming', 'Needs follow-up', 'Multiple pets']} searchPlaceholder="Search client, phone, pet..." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {clients.map((client) => <ClientCard key={client.name} {...client} />)}
      </div>
    </div>
    </DataState>
  );
}

export function RedesignedClinicSettings() {
  const settingsState = useClinicSettings();
  const settings = settingsState.data;
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSave = async (body: {
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    description: string;
    workingHours: UpsertClinicWorkingHourRequest[];
  }) => {
    setSaving(true);
    setActionError(null);
    try {
      await clinicApi.updateSettings({
        name: body.name,
        address: body.address,
        phoneNumber: body.phoneNumber,
        email: body.email,
        description: body.description || null,
      });
      await clinicApi.replaceWorkingHours(body.workingHours);
      settingsState.reload();
    } catch (error) {
      setActionError(formatApiError(error, 'Could not save clinic settings.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DataState loading={settingsState.loading} error={settingsState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Clinic settings and preferences." description="Clinic info, working hours, appointment duration, notifications, branding, and preferences." icon={Settings} />
      <ClinicSettingsEditor settings={settings} loading={saving} error={actionError} onSubmit={handleSave} />
    </div>
    </DataState>
  );
}

function SettingsPanel({ title, fields, disabled = false }: Readonly<{ title: string; fields: string[]; disabled?: boolean }>) {
  return (
    <Surface className="p-5">
      <SectionHeader title={title} />
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field} className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">{field}</span>
            <input disabled={disabled} className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm outline-none focus:border-teal-200 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:bg-slate-100 disabled:text-slate-500" placeholder={field} />
          </label>
        ))}
      </div>
    </Surface>
  );
}

export function RedesignedProfilePage() {
  const { user } = useAuth();
  const initials = `${user!.firstName.charAt(0)}${user!.lastName.charAt(0) || user!.firstName.charAt(1) || ''}`.toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Profile & account" title="Your VetVik account" description="Manage your personal information, security settings, and notifications." icon={Users} />
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Surface className="p-6 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-teal-400 to-amber-300 text-2xl font-black text-white shadow-xl">{initials}</div>
          <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] text-slate-950">{user!.firstName} {user!.lastName}</h2>
          <p className="text-sm text-slate-500">{roleLabel(user!.role)}</p>
          <div className="mt-5"><UploadAvatar label="Upload avatar" /></div>
        </Surface>
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="My Profile" description="Current account data restored from your authenticated session." />
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['First name', user!.firstName],
                ['Last name', user!.lastName || '—'],
                ['Email', user!.email],
                ['Role', roleLabel(user!.role)],
              ].map(([label, value]) => (
                <label key={label} className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
                  <input disabled value={value} className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-100 px-4 text-sm text-slate-500 outline-none" />
                </label>
              ))}
            </div>
          </Surface>
          <EmptyState
            title="Account details are read-only"
            description="The current backend API exposes the authenticated session profile, but no profile-update, password, or notification-preference endpoints were found during the API audit."
          />
          <Surface className="p-5">
            <SectionHeader title="Notifications" />
            <div className="grid gap-3">
              {['Appointment reminders', 'Medical record updates', 'Clinic announcements'].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3"><Bell className="h-4 w-4 text-teal-600" /><span className="font-bold text-slate-700">{item}</span></div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600">Unavailable</span>
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
  const insightsState = useAdminInsights();
  const doctorsState = useDoctors(true);
  const appointmentsState = useAdminAppointments();
  const insights = insightsState.data;
  const doctorViews = doctorsState.data.map((d) =>
    mapDoctor(d, appointmentsState.data.filter((a) => a.doctorId === d.id).length),
  );
  const serviceData = insights.serviceDistribution;
  const speciesTotal = insights.speciesDistribution.reduce((sum, item) => sum + item.value, 0) || 1;
  const speciesData = insights.speciesDistribution.map((item, index) => ({
    name: item.name,
    value: Math.round((item.value / speciesTotal) * 100),
    color: ['#14b8a6', '#38bdf8', '#f59e0b', '#fb7185'][index % 4],
  }));
  const completionRatio = insights.monthlyVisits
    ? Math.round((insights.completedVisits / insights.monthlyVisits) * 100)
    : 0;

  return (
    <DataState loading={insightsState.loading} error={insightsState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Admin insights" title="Powerful clinic analytics in one dedicated place." description="Trends, workload, distribution, utilization, growth, and operational insights live here so regular pages stay focused." icon={BarChart3} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Monthly visits" value={insights.monthlyVisits} caption="Current month" icon={Calendar} tone="teal" />
        <MetricCard label="Completion ratio" value={`${completionRatio}%`} caption="Completed vs total" icon={CheckCircle2} tone="green" />
        <MetricCard label="Active doctors" value={insights.activeDoctors} caption="Currently available" icon={ShieldCheck} tone="blue" />
        <MetricCard label="Cancelled" value={insights.cancelledVisits} caption="Current month" icon={Users} tone="amber" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <AnalyticsCard title="Appointment trend">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={insights.monthlyTrend}>
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
            <BarChart data={doctorViews.map((doctor) => ({ name: doctor.name.replace('Dr. ', ''), visits: doctor.todayAppointments }))}>
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
            <BarChart data={insights.weeklyWorkload}>
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
            <EmptyState
              title="Narrative insights are not available"
              description="This panel now waits for backend-provided operational recommendations instead of showing hardcoded advice."
            />
          </div>
        </Surface>
      </div>
    </div>
    </DataState>
  );
}
