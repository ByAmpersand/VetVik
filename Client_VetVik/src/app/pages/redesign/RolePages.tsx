import { useEffect, useMemo, useState, type FormEvent, type ReactNode, type SVGProps } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AlertCircle,
  BarChart3,
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
import { calcAge, formatDate, formatTime, mapAppointmentStatus } from '../../data/formatters';
import {
  appointmentsApi,
  authApi,
  clinicApi,
  doctorsApi,
  medicalRecordsApi,
  petsApi,
  staffApi,
} from '../../../api/endpoints';
import {
  attachPetPhotosToAppointments,
  buildLastVisitByPetId,
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
import { GalleryImagePicker } from '../../components/redesign/GalleryImagePicker';
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
  resolvePetBreedName,
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

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const DAY_LABELS: Record<string, string> = {
  Sunday: 'Sunday',
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
  Saturday: 'Saturday',
};

function dayLabel(dayOfWeek: number | string): string {
  if (typeof dayOfWeek === 'number') return DAY_NAMES[dayOfWeek] ?? String(dayOfWeek);
  return DAY_LABELS[dayOfWeek] ?? dayOfWeek;
}

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
  const trimmed = value.trim();
  const twentyFourHour = /^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(trimmed);
  if (twentyFourHour) {
    const hours = twentyFourHour[1].padStart(2, '0');
    const minutes = twentyFourHour[2];
    return `${hours}:${minutes}`;
  }

  const amPm = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(am|pm)$/i.exec(trimmed);
  if (amPm) {
    const rawHours = Number(amPm[1]);
    const minutes = amPm[2];
    const meridiem = amPm[3].toLowerCase();
    const normalizedHours = meridiem === 'pm'
      ? (rawHours % 12) + 12
      : rawHours % 12;
    return `${String(normalizedHours).padStart(2, '0')}:${minutes}`;
  }

  return '09:00';
}

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseExperienceYears(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const whole = Math.round(parsed);
  return Math.max(0, whole);
}

function toggleSelection(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function isOpenAppointmentStatus(status: string): boolean {
  return status === 'Awaiting' || status === 'Accepted';
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
    photoUrl: pet?.photoUrl ?? null,
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
      photoUrl: draft.photoUrl,
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
      description="Save the pet identity, species and care notes."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <PetAvatar
            species={speciesState.data.find((item) => item.id === draft.speciesId)?.name ?? 'Pet'}
            photoUrl={draft.photoUrl}
            onPhotoSelect={(photoUrl) => setDraft((prev) => ({ ...prev, photoUrl }))}
          />
          <div>
            <p className="text-sm font-bold text-slate-200">Pet photo</p>
            <p className="mt-1 text-xs text-slate-400">Choose a photo from your gallery for this pet profile.</p>
            <div className="mt-3">
              <UploadAvatar onChange={(photoUrl) => setDraft((prev) => ({ ...prev, photoUrl }))} />
            </div>
          </div>
        </div>
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

type BookingMode = 'specific-doctor' | 'first-available';
type TimeWindowId = 'any' | 'morning' | 'afternoon' | 'evening';

interface TimeWindowConfig {
  id: TimeWindowId;
  label: string;
  fromMinutes: number;
  toMinutes: number;
}

interface SlotCandidate {
  value: string;
  doctorId: string;
  roomId: string;
  startsAt: Date;
  doctorName: string;
  roomName: string;
}

function buildSlotKey(doctorId: string, roomId: string, startsAt: Date): string {
  const localValue = toDateTimeInputValue(startsAt.toISOString());
  return `${doctorId}|${roomId}|${localValue}`;
}

function parseSlotKey(value: string): { doctorId: string; roomId: string; startAt: string } {
  const [doctorId = '', roomId = '', startAt = ''] = value.split('|');
  return { doctorId, roomId, startAt };
}

interface AppointmentClient {
  ownerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}

interface AppointmentPet {
  id: string;
  name: string;
  ownerId: string;
  ownerName?: string;
}

interface AppointmentService {
  id: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  durationMinutes?: number;
}

const SLOT_INTERVAL_MINUTES = 30;
const TIME_WINDOWS: TimeWindowConfig[] = [
  { id: 'any', label: 'Any time', fromMinutes: 0, toMinutes: 24 * 60 },
  { id: 'morning', label: 'Morning (08:00–12:00)', fromMinutes: 8 * 60, toMinutes: 12 * 60 },
  { id: 'afternoon', label: 'Afternoon (12:00–16:00)', fromMinutes: 12 * 60, toMinutes: 16 * 60 },
  { id: 'evening', label: 'Evening (16:00–20:00)', fromMinutes: 16 * 60, toMinutes: 20 * 60 },
];

function formatDateInput(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateAtMinute(dateInput: string, minuteOfDay: number): Date {
  const [year, month, day] = dateInput.split('-').map(Number);
  const hours = Math.floor(minuteOfDay / 60);
  const minutes = minuteOfDay % 60;
  return new Date(year, (month || 1) - 1, day || 1, hours, minutes, 0, 0);
}

function AppointmentFormDialog({
  open,
  title,
  description,
  appointment,
  pets,
  clients,
  doctors,
  fixedDoctorId,
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
  pets: AppointmentPet[];
  clients?: AppointmentClient[];
  doctors: DoctorResponse[];
  fixedDoctorId?: string | null;
  rooms: Array<{ id: string; name: string }>;
  services: AppointmentService[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (body: CreateAppointmentRequest | UpdateAppointmentRequest) => Promise<void>;
  variant?: 'owner' | 'clinic' | 'doctor';
}>) {
  const isOwnerBooking = variant === 'owner';
  const isDoctorBooking = variant === 'doctor';
  const resolvedDoctorId = isDoctorBooking ? (fixedDoctorId ?? '') : '';
  const bookableDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.isActive),
    [doctors],
  );
  const [draft, setDraft] = useState(() => buildAppointmentDraft(appointment));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bookingMode, setBookingMode] = useState<BookingMode>('first-available');
  const [preferredDate, setPreferredDate] = useState(() => formatDateInput(new Date()));
  const [timeWindow, setTimeWindow] = useState<TimeWindowId>('any');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<SlotCandidate[]>([]);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [serviceCategoryId, setServiceCategoryId] = useState<string>('all');

  const initialOwnerIdFromAppointment = (appointment as AppointmentResponse | null)?.ownerId ?? '';
  const initialOwnerIdFromPet = useMemo(() => {
    if (!appointment) return '';
    return pets.find((pet) => pet.id === appointment.petId)?.ownerId ?? '';
  }, [appointment, pets]);

  useEffect(() => {
    if (!open) return;
    setDraft({
      ...buildAppointmentDraft(appointment),
      doctorId: appointment?.doctorId ?? resolvedDoctorId,
    });
    setFieldErrors({});
    setBookingMode(isOwnerBooking || isDoctorBooking ? 'specific-doctor' : 'first-available');
    setPreferredDate(formatDateInput(appointment?.startAt ? new Date(appointment.startAt) : new Date()));
    setTimeWindow('any');
    setAvailableSlots([]);
    setSlotsError(null);
    setOwnerSearch('');
    if (!isOwnerBooking) {
      setSelectedOwnerId(initialOwnerIdFromAppointment || initialOwnerIdFromPet || '');
    } else {
      setSelectedOwnerId('');
    }
    const initialService = services.find((service) => service.id === appointment?.serviceId);
    setServiceCategoryId(initialService?.categoryId ?? 'all');
  }, [appointment, isDoctorBooking, isOwnerBooking, open, resolvedDoctorId, initialOwnerIdFromAppointment, initialOwnerIdFromPet, services]);

  const filteredClients = useMemo(() => {
    if (!clients?.length) return [] as AppointmentClient[];
    const query = ownerSearch.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) => {
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      const reverseName = `${client.lastName} ${client.firstName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        reverseName.includes(query) ||
        client.email.toLowerCase().includes(query) ||
        (client.phone ?? '').toLowerCase().includes(query)
      );
    });
  }, [clients, ownerSearch]);

  const ownerScopedPets = useMemo(() => {
    if (isOwnerBooking) return pets;
    if (!selectedOwnerId) return [];
    return pets.filter((pet) => pet.ownerId === selectedOwnerId);
  }, [isOwnerBooking, pets, selectedOwnerId]);

  const serviceCategories = useMemo(() => {
    const map = new Map<string, string>();
    for (const service of services) {
      if (service.categoryId && !map.has(service.categoryId)) {
        map.set(service.categoryId, service.categoryName ?? 'Procedure');
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [services]);

  const filteredServices = useMemo(() => {
    if (serviceCategoryId === 'all') return services;
    return services.filter((service) => service.categoryId === serviceCategoryId);
  }, [services, serviceCategoryId]);

  const selectedClient = clients?.find((client) => client.ownerId === selectedOwnerId) ?? null;

  useEffect(() => {
    if (!open) return;
    if (!draft.serviceId || !preferredDate) {
      setAvailableSlots([]);
      setSlotsError(null);
      return;
    }
    if (bookingMode === 'specific-doctor' && !draft.doctorId && !resolvedDoctorId) {
      setAvailableSlots([]);
      setSlotsError(null);
      return;
    }

    const selectedWindow = TIME_WINDOWS.find((window) => window.id === timeWindow) ?? TIME_WINDOWS[0];
    const fromLocal = parseDateAtMinute(preferredDate, selectedWindow.fromMinutes);
    const toLocal =
      selectedWindow.toMinutes >= 24 * 60
        ? new Date(fromLocal.getFullYear(), fromLocal.getMonth(), fromLocal.getDate() + 1, 0, 0, 0, 0)
        : parseDateAtMinute(preferredDate, selectedWindow.toMinutes);

    let isCancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);

    appointmentsApi
      .availableSlots({
        serviceId: draft.serviceId,
        from: fromLocal.toISOString(),
        to: toLocal.toISOString(),
        doctorId: bookingMode === 'specific-doctor' ? (resolvedDoctorId || draft.doctorId) : null,
        roomId: draft.roomId || null,
        stepMinutes: SLOT_INTERVAL_MINUTES,
        maxSlots: 120,
      })
      .then((apiSlots) => {
        if (isCancelled) return;
        const mapped = apiSlots
          .map((slot) => {
            const startsAt = new Date(slot.startAt);
            if (Number.isNaN(startsAt.getTime())) return null;
            return {
              value: buildSlotKey(slot.doctorId, slot.roomId, startsAt),
              doctorId: slot.doctorId,
              roomId: slot.roomId,
              startsAt,
              doctorName: slot.doctorFullName,
              roomName: slot.roomName,
            } satisfies SlotCandidate;
          })
          .filter((slot): slot is SlotCandidate => Boolean(slot))
          .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());
        setAvailableSlots(mapped);
      })
      .catch(() => {
        if (!isCancelled) {
          setAvailableSlots([]);
          setSlotsError('Could not load available slots. Please try again.');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setSlotsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [draft.doctorId, draft.roomId, draft.serviceId, open, bookingMode, preferredDate, resolvedDoctorId, timeWindow]);

  const selectedSlotValue = useMemo(() => {
    const doctorId = resolvedDoctorId || draft.doctorId;
    if (!doctorId || !draft.startAt) return '';
    const matched = availableSlots.find(
      (slot) =>
        slot.doctorId === doctorId &&
        toDateTimeInputValue(slot.startsAt.toISOString()) === draft.startAt,
    );
    if (matched) return matched.value;
    return buildSlotKey(doctorId, draft.roomId, new Date(draft.startAt));
  }, [availableSlots, draft.doctorId, draft.roomId, draft.startAt, resolvedDoctorId]);

  const slotOptions: SelectOption[] = useMemo(
    () =>
      availableSlots.map((slot) => {
        const timeLabel = slot.startsAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', hour12: false });
        return {
          value: slot.value,
          label: slot.roomName
            ? `${timeLabel} · ${slot.doctorName} · ${slot.roomName}`
            : `${timeLabel} · ${slot.doctorName}`,
        };
      }),
    [availableSlots],
  );

  const handleSelectSlot = (slot: SlotCandidate) => {
    const { startAt } = parseSlotKey(slot.value);
    setDraft((prev) => ({
      ...prev,
      doctorId: slot.doctorId,
      roomId: slot.roomId || prev.roomId,
      startAt,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!isOwnerBooking && !selectedOwnerId) nextErrors.ownerId = 'Owner is required.';
    if (!draft.petId) nextErrors.petId = 'Pet is required.';
    if (!draft.serviceId) nextErrors.serviceId = 'Procedure is required.';
    if (bookingMode === 'specific-doctor' && !draft.doctorId && !resolvedDoctorId) {
      nextErrors.doctorId = 'Doctor is required.';
    }
    if (!draft.startAt) nextErrors.startAt = 'Start time is required.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateAppointmentRequest = {
      petId: draft.petId,
      doctorId: resolvedDoctorId || draft.doctorId || null,
      serviceId: draft.serviceId,
      startAt: new Date(draft.startAt).toISOString(),
      endAt: null,
      reason: draft.reason.trim() || null,
      notes: isOwnerBooking ? null : draft.notes.trim() || null,
    };

    if (isOwnerBooking) {
      await onSubmit(payload);
      return;
    }

    await onSubmit({
      ...payload,
      roomId: draft.roomId || null,
      notes: draft.notes.trim() || null,
      ownerId: selectedOwnerId || null,
    });
  };

  const handleSelectOwner = (ownerId: string) => {
    setSelectedOwnerId(ownerId);
    setDraft((prev) => ({ ...prev, petId: '', startAt: '' }));
  };

  const slotPlaceholder = !draft.serviceId
    ? 'Select procedure first'
    : slotsLoading
      ? 'Loading available slots...'
      : bookingMode === 'specific-doctor' && !draft.doctorId && !resolvedDoctorId
        ? 'Select doctor first'
        : slotOptions.length
          ? 'Pick a free slot'
          : 'No free slots in selected window';

  return (
    <FormDialog open={open} title={title} description={description} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {!isOwnerBooking ? (
          <Surface className="mb-4 p-4">
            <SectionHeader
              title="Step 1 — Owner"
              description="Search by name, surname, email or phone, then pick the client."
            />
            <FormField
              label="Search owner"
              value={ownerSearch}
              onChange={setOwnerSearch}
              placeholder="Type a name, surname, email or phone..."
            />
            {ownerSearch.trim() && !selectedOwnerId ? (
              <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                {filteredClients.length ? (
                  filteredClients.slice(0, 12).map((client) => (
                    <button
                      key={client.ownerId}
                      type="button"
                      onClick={() => handleSelectOwner(client.ownerId)}
                      className="block w-full rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-left transition hover:border-teal-400/60 hover:bg-slate-900"
                    >
                      <p className="font-black text-white">{client.firstName} {client.lastName}</p>
                      <p className="text-xs text-slate-400">{client.email}{client.phone ? ` · ${client.phone}` : ''}</p>
                    </button>
                  ))
                ) : (
                  <p className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-400">
                    No clients match your search.
                  </p>
                )}
              </div>
            ) : null}
            {selectedClient ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-400/40 bg-teal-500/10 p-3">
                <div>
                  <p className="font-black text-white">{selectedClient.firstName} {selectedClient.lastName}</p>
                  <p className="text-xs text-slate-300">{selectedClient.email}{selectedClient.phone ? ` · ${selectedClient.phone}` : ''}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOwnerId('');
                    setDraft((prev) => ({ ...prev, petId: '', startAt: '' }));
                  }}
                  className="rounded-2xl border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800"
                >
                  Change owner
                </button>
              </div>
            ) : null}
            {fieldErrors.ownerId ? (
              <p className="mt-2 text-xs font-bold text-rose-400">{fieldErrors.ownerId}</p>
            ) : null}
          </Surface>
        ) : null}

        <FormGrid columns={2}>
          <FormSelect
            label={isOwnerBooking ? 'Pet' : 'Step 2 — Pet'}
            value={draft.petId}
            onChange={(value) => setDraft((prev) => ({ ...prev, petId: value }))}
            options={ownerScopedPets.map((pet) => ({
              value: pet.id,
              label: pet.ownerName && isOwnerBooking ? `${pet.name} · ${pet.ownerName}` : pet.name,
            }))}
            placeholder={
              !isOwnerBooking && !selectedOwnerId
                ? 'Select an owner first'
                : ownerScopedPets.length
                  ? 'Select pet'
                  : isOwnerBooking
                    ? 'Add a pet first'
                    : 'This client has no pets yet'
            }
            error={fieldErrors.petId}
          />
          {!isOwnerBooking && serviceCategories.length > 0 ? (
            <FormSelect
              label="Procedure type"
              value={serviceCategoryId}
              onChange={(value) => {
                setServiceCategoryId(value);
                setDraft((prev) => ({ ...prev, serviceId: '', startAt: '' }));
              }}
              options={[
                { value: 'all', label: 'All procedure types' },
                ...serviceCategories.map((category) => ({ value: category.id, label: category.name })),
              ]}
            />
          ) : null}
          <FormSelect
            label={isOwnerBooking ? 'Service' : 'Procedure'}
            value={draft.serviceId}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                serviceId: value,
                startAt: '',
                doctorId: resolvedDoctorId || (bookingMode === 'specific-doctor' ? prev.doctorId : ''),
              }))
            }
            options={filteredServices.map((service) => ({
              value: service.id,
              label: service.durationMinutes ? `${service.name} · ${service.durationMinutes} min` : service.name,
            }))}
            placeholder={filteredServices.length ? 'Select procedure' : 'No procedures available'}
            error={fieldErrors.serviceId}
          />
          {!isDoctorBooking ? (
            <FormSelect
              label={isOwnerBooking ? 'Booking preference' : 'Slot search mode'}
              value={bookingMode}
              onChange={(value) => {
                const nextMode = value as BookingMode;
                setBookingMode(nextMode);
                setDraft((prev) => ({
                  ...prev,
                  startAt: '',
                  doctorId: nextMode === 'specific-doctor' ? prev.doctorId : '',
                }));
              }}
              options={[
                { value: 'first-available', label: 'Any doctor — search by time' },
                { value: 'specific-doctor', label: 'Specific doctor — show their free hours' },
              ]}
            />
          ) : null}
          {bookingMode === 'specific-doctor' && !isDoctorBooking ? (
            <FormSelect
              label="Doctor"
              value={draft.doctorId}
              onChange={(value) => setDraft((prev) => ({ ...prev, doctorId: value, startAt: '' }))}
              options={bookableDoctors.map((doctor) => ({
                value: doctor.id,
                label: formatDoctorOptionLabel(doctor),
              }))}
              placeholder={bookableDoctors.length ? 'Select doctor' : 'No doctors available'}
              error={fieldErrors.doctorId}
            />
          ) : null}
          {!isOwnerBooking ? (
            <FormSelect
              label="Room (optional)"
              value={draft.roomId}
              onChange={(value) => setDraft((prev) => ({ ...prev, roomId: value, startAt: '' }))}
              options={[
                { value: '', label: 'Auto-assign free room' },
                ...rooms.map((room) => ({ value: room.id, label: room.name })),
              ]}
              placeholder={rooms.length ? 'Select room' : 'No rooms available'}
              error={fieldErrors.roomId}
            />
          ) : null}
          <FormField
            label="Preferred date"
            type="date"
            value={preferredDate}
            onChange={(value) => {
              setPreferredDate(value);
              setDraft((prev) => ({ ...prev, startAt: '' }));
            }}
          />
          <FormSelect
            label="Preferred time"
            value={timeWindow}
            onChange={(value) => {
              setTimeWindow(value as TimeWindowId);
              setDraft((prev) => ({ ...prev, startAt: '' }));
            }}
            options={TIME_WINDOWS.map((window) => ({ value: window.id, label: window.label }))}
          />
          <FormSelect
            label="Available slots"
            value={selectedSlotValue}
            onChange={(value) => {
              const { doctorId, roomId, startAt } = parseSlotKey(value);
              setDraft((prev) => ({
                ...prev,
                doctorId: doctorId || prev.doctorId,
                roomId: roomId || prev.roomId,
                startAt: startAt || '',
              }));
            }}
            options={slotOptions}
            placeholder={slotPlaceholder}
            error={fieldErrors.startAt}
          />
          {availableSlots.length ? (
            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Quick pick
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {availableSlots.slice(0, 12).map((slot) => {
                  const isSelected = selectedSlotValue === slot.value;
                  const slotTime = slot.startsAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', hour12: false });
                  return (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => handleSelectSlot(slot)}
                      className={`rounded-2xl border px-3 py-2 text-left text-xs transition ${
                        isSelected
                          ? 'border-teal-300 bg-teal-500/15 text-teal-100'
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-teal-500/60 hover:text-slate-100'
                      }`}
                    >
                      <p className="font-black">{slotTime}</p>
                      <p className="mt-0.5 truncate">{slot.doctorName}</p>
                      <p className="truncate text-slate-400">{slot.roomName}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </FormGrid>
        {slotsError ? (
          <p className="mt-3 text-sm font-bold text-amber-300">{slotsError}</p>
        ) : null}
        {isOwnerBooking ? (
          <p className="mt-4 text-sm leading-6 text-slate-400">
            After you submit, the doctor receives this request and confirms it. Once confirmed, your appointment status changes to Accepted.
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
          submitLabel={
            appointment
              ? 'Save appointment'
              : isOwnerBooking
                ? 'Send booking request'
                : 'Create appointment'
          }
          submittingLabel="Saving..."
          loading={loading}
        />
      </form>
    </FormDialog>
  );
}

function AppointmentDetailDialog({
  appointment,
  pets,
  clients,
  onClose,
  onEdit,
}: Readonly<{
  appointment: AppointmentResponse | null;
  pets: PetResponse[];
  clients: Array<{ ownerId: string; firstName: string; lastName: string; email: string; phone?: string | null }>;
  onClose: () => void;
  onEdit?: (appointmentId: string) => void;
}>) {
  const open = Boolean(appointment);
  if (!appointment) return null;

  const pet = pets.find((item) => item.id === appointment.petId) ?? null;
  const client = clients.find((item) => item.ownerId === appointment.ownerId) ?? null;
  const guarantorNotes = parseGuarantorFromNotes(appointment.notes);
  const breedName = pet ? resolvePetBreedName(pet.breedName, pet.notes) : '';
  const careNotes = pet ? parseCustomBreedFromNotes(pet.notes).careNotes : '';

  return (
    <FormDialog
      open={open}
      title={`${appointment.petName} · ${appointment.serviceName}`}
      description={`${formatDate(appointment.startAt)} at ${formatTime(appointment.startAt)} · ${appointment.doctorFullName}`}
      onClose={onClose}
      widthClassName="max-w-4xl"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Surface className="p-5">
          <SectionHeader title="Visit summary" />
          <div className="space-y-2 text-sm text-slate-200">
            <DetailRow label="Status"><StatusBadge status={mapAppointmentStatus(appointment.status)} /></DetailRow>
            <DetailRow label="Procedure" value={appointment.serviceName} />
            <DetailRow label="Doctor" value={appointment.doctorFullName} />
            <DetailRow label="Room" value={appointment.roomName || '—'} />
            <DetailRow label="Duration" value={`${appointment.serviceDurationMinutes} min`} />
            <DetailRow label="Reason" value={appointment.reason || '—'} />
            <DetailRow label="Notes" value={appointment.notes || '—'} />
          </div>
        </Surface>

        <Surface className="p-5">
          <SectionHeader title="Pet" description="Animal information for this visit." />
          {pet ? (
            <div className="flex gap-4">
              <PetAvatar species={pet.speciesName} size="lg" photoUrl={pet.photoUrl} />
              <div className="space-y-1 text-sm text-slate-200">
                <p className="text-lg font-black text-white">{pet.name}</p>
                <p className="text-slate-400">{pet.speciesName}{breedName ? ` · ${breedName}` : ''}</p>
                <DetailRow label="Sex" value={pet.sex === 'Unknown' ? '—' : pet.sex} />
                <DetailRow label="Age" value={pet.birthDate ? `${calcAge(pet.birthDate)} year(s)` : '—'} />
                <DetailRow label="Weight" value={pet.weight != null ? `${pet.weight} kg` : '—'} />
                {careNotes ? <DetailRow label="Care notes" value={careNotes} /> : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Pet record not available.</p>
          )}
        </Surface>

        <Surface className="p-5">
          <SectionHeader title="Owner" description="Primary client for this animal." />
          {client ? (
            <div className="space-y-1 text-sm text-slate-200">
              <p className="text-lg font-black text-white">{client.firstName} {client.lastName}</p>
              <DetailRow label="Email" value={client.email} />
              <DetailRow label="Phone" value={client.phone || '—'} />
              <DetailRow label="Owner ID" value={client.ownerId.slice(0, 8) + '…'} />
            </div>
          ) : (
            <div className="text-sm text-slate-200">
              <p className="font-black text-white">{appointment.ownerFullName}</p>
              <p className="mt-1 text-slate-400">Owner directory entry not loaded.</p>
            </div>
          )}
        </Surface>

        <Surface className="p-5">
          <SectionHeader title="Guarantor" description="Person responsible for this visit, if different from the owner." />
          {guarantorNotes ? (
            <p className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100">
              {guarantorNotes}
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              No guarantor on record. Add a line starting with “Guarantor:” to the visit notes to capture one.
            </p>
          )}
        </Surface>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-5">
        <PrimaryButton variant="ghost" onClick={onClose}>Close</PrimaryButton>
        {onEdit ? (
          <PrimaryButton icon={Edit3} onClick={() => onEdit(appointment.id)}>Edit appointment</PrimaryButton>
        ) : null}
      </div>
    </FormDialog>
  );
}

function DetailRow({ label, value, children }: Readonly<{ label: string; value?: string; children?: ReactNode }>) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
      {children ?? <span className="text-sm font-semibold text-slate-100">{value}</span>}
    </div>
  );
}

function parseGuarantorFromNotes(notes?: string | null): string | null {
  if (!notes) return null;
  const lines = notes.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    const match = /^(guarantor|поручник|guarant\.)\s*[:-]\s*(.+)$/i.exec(trimmed);
    if (match) return match[2].trim();
  }
  return null;
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
  appointmentStatus,
  loading,
  error,
  onSave,
  onComplete,
}: Readonly<{
  record?: MedicalRecordResponse | null;
  appointmentId: string;
  appointmentStatus: string;
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
  const isAccepted = appointmentStatus === 'Accepted';
  const isCompleted = appointmentStatus === 'Completed';
  const canSaveNote = isCompleted || Boolean(record);
  const canCompleteWithNote = isAccepted;
  const isReadOnly = !canSaveNote && !canCompleteWithNote;

  return (
    <Surface className="p-5">
      <SectionHeader
        title="Clinical note"
        description={
          isAccepted
            ? 'Write the clinical note, then complete the visit to save it to the medical record.'
            : 'Write symptoms, diagnosis, treatment and recommendations directly against the appointment.'
        }
      />
      <div className="grid gap-4">
        <FormTextArea label="Symptoms" value={draft.symptoms} disabled={isReadOnly} onChange={(value) => setDraft((prev) => ({ ...prev, symptoms: value }))} />
        <FormTextArea label="Diagnosis" value={draft.diagnosis} disabled={isReadOnly} onChange={(value) => setDraft((prev) => ({ ...prev, diagnosis: value }))} />
        <FormTextArea label="Treatment" value={draft.treatment} disabled={isReadOnly} onChange={(value) => setDraft((prev) => ({ ...prev, treatment: value }))} />
        <FormTextArea label="Recommendations" value={draft.recommendations} disabled={isReadOnly} onChange={(value) => setDraft((prev) => ({ ...prev, recommendations: value }))} />
      </div>
      <FormErrorMessage message={error} />
      {isReadOnly ? (
        <p className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-400">
          This appointment is {appointmentStatus.toLowerCase()}, so it cannot be completed or saved as a new medical record.
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        {canSaveNote ? (
          <PrimaryButton
            variant="secondary"
            icon={Save}
            disabled={loading}
            onClick={() => void onSave(payload)}
          >
            {record ? 'Update note' : 'Save note'}
          </PrimaryButton>
        ) : null}
        {canCompleteWithNote ? (
          <PrimaryButton icon={CheckCircle2} disabled={loading} onClick={() => void onComplete(payload)}>
            Complete visit & save note
          </PrimaryButton>
        ) : null}
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
  onUpdate: (body: { firstName: string; lastName: string; bio: string; isActive: boolean; experienceYears: number | null; specializationIds: string[] }) => Promise<void>;
}>) {
  const [draft, setDraft] = useState({
    email: doctor?.email ?? '',
    password: '',
    firstName: doctor?.firstName ?? '',
    lastName: doctor?.lastName ?? '',
    bio: doctor?.bio ?? '',
    experienceYears: doctor?.experienceYears != null ? String(doctor.experienceYears) : '',
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
        experienceYears: doctor?.experienceYears != null ? String(doctor.experienceYears) : '',
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
    if (draft.experienceYears.trim()) {
      const normalizedExperience = parseExperienceYears(draft.experienceYears);
      if (normalizedExperience == null || normalizedExperience > 80) {
        nextErrors.experienceYears = 'Experience must be between 0 and 80 years.';
      }
    }
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
        experienceYears: parseExperienceYears(draft.experienceYears),
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
      experienceYears: parseExperienceYears(draft.experienceYears),
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
          <FormField
            label="Experience (years)"
            type="number"
            min={0}
            step={1}
            value={draft.experienceYears}
            onChange={(value) => setDraft((prev) => ({ ...prev, experienceYears: value }))}
            placeholder="e.g. 5"
            error={fieldErrors.experienceYears}
          />
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

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
        dayOfWeek: DAY_NAMES[index],
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
                <div key={hour.dayOfWeek} className="grid items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:grid-cols-[130px_140px_140px_90px]">
                  <p className="text-sm font-black uppercase tracking-wide text-slate-100">{dayLabel(hour.dayOfWeek)}</p>
                  <input
                    value={hour.openTime}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        workingHours: workingHours.map((item) =>
                          item.dayOfWeek === hour.dayOfWeek ? { ...item, openTime: event.target.value } : item,
                        ),
                      }))
                    }
                    onBlur={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        workingHours: workingHours.map((item) =>
                          item.dayOfWeek === hour.dayOfWeek ? { ...item, openTime: timeValue(event.target.value) } : item,
                        ),
                      }))
                    }
                    type="text"
                    inputMode="numeric"
                    placeholder="09:00"
                    disabled={!hour.isWorkingDay}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 disabled:opacity-40"
                  />
                  <input
                    value={hour.closeTime}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        workingHours: workingHours.map((item) =>
                          item.dayOfWeek === hour.dayOfWeek ? { ...item, closeTime: event.target.value } : item,
                        ),
                      }))
                    }
                    onBlur={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        workingHours: workingHours.map((item) =>
                          item.dayOfWeek === hour.dayOfWeek ? { ...item, closeTime: timeValue(event.target.value) } : item,
                        ),
                      }))
                    }
                    type="text"
                    inputMode="numeric"
                    placeholder="18:00"
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
                    <span>Open</span>
                  </label>
                </div>
              ))}
            </div>
          </Surface>
        </div>
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="Branding" description="Choose a clinic logo from your gallery for local preview." />
            <GalleryImagePicker onSelect={setLogoPreview} onError={setLogoError}>
              {(open) => (
                <button
                  type="button"
                  onClick={open}
                  className="w-full rounded-[1.6rem] border border-dashed border-teal-400/40 bg-teal-500/10 p-8 text-center transition hover:bg-teal-500/20"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Clinic logo preview" className="mx-auto h-24 max-w-full object-contain" />
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-teal-200" />
                      <p className="mt-3 font-black text-teal-100">Choose from gallery</p>
                      <p className="mt-1 text-sm text-teal-200">Select a logo image from your device.</p>
                    </>
                  )}
                </button>
              )}
            </GalleryImagePicker>
            {logoError ? <p className="mt-3 text-sm font-bold text-rose-600">{logoError}</p> : null}
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

  const lastVisitByPetId = useMemo(
    () => buildLastVisitByPetId(recordsState.data, appointmentsState.data),
    [recordsState.data, appointmentsState.data],
  );
  const ownerPets = useMemo(
    () => petsState.data.map((pet) => mapPet(pet, { lastVisit: lastVisitByPetId.get(pet.id) ?? null })),
    [petsState.data, lastVisitByPetId],
  );
  const ownerAppointments = attachPetPhotosToAppointments(
    appointmentsState.data.map(mapAppointment),
    petsState.data,
  );
  const awaitingAppointments = ownerAppointments.filter((a) => a.status === 'Awaiting');
  const acceptedAppointments = ownerAppointments.filter((a) => a.status === 'Accepted');
  const upcomingOwner = ownerAppointments.filter((a) => isOpenAppointmentStatus(a.status));
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
      {awaitingAppointments.length > 0 && (
        <Surface className="border border-amber-400/30 bg-amber-500/10 p-5">
          <SectionHeader
            title={`${awaitingAppointments.length} booking request${awaitingAppointments.length > 1 ? 's' : ''} awaiting confirmation`}
            description="The doctor hasn't confirmed yet. You'll see Accepted once they respond."
            action={<PrimaryButton variant="secondary" icon={Calendar} onClick={() => navigate('/client/appointments')}>View all</PrimaryButton>}
          />
          <div className="mt-3 space-y-3">
            {awaitingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </Surface>
      )}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="Next confirmed appointment" description="The most important care event is always surfaced first." action={<PrimaryButton variant="secondary" icon={Calendar} onClick={() => navigate('/client/appointments')}>Manage</PrimaryButton>} />
            {acceptedAppointments[0]
              ? <AppointmentCard appointment={acceptedAppointments[0]} />
              : upcomingOwner[0]
                ? <AppointmentCard appointment={upcomingOwner[0]} />
                : <EmptyState title="No appointment yet" description="Book a visit and it will appear here." />}
          </Surface>
          <div className="grid gap-4 md:grid-cols-3">
            {ownerPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onOpen={() => navigate(`/client/pets/${pet.id}`)} onBook={() => navigate('/client/appointments')} />
            ))}
          </div>
          <Surface className="p-5">
            <SectionHeader title="Recent medical updates" description="Clinical history as a readable care timeline." action={<button onClick={() => navigate('/client/medical-history')} className="text-sm font-bold text-teal-300 hover:text-teal-200">View all</button>} />
            <MedicalTimeline records={records} />
          </Surface>
        </div>
        <div className="space-y-5">
          <MetricCard label="Pets in care" value={ownerPets.length} caption="Family profiles" icon={PawPrint} tone="teal" />
          <MetricCard label="Awaiting" value={awaitingAppointments.length} caption="Pending doctor confirmation" icon={AlertCircle} tone="amber" />
          <MetricCard label="Confirmed" value={acceptedAppointments.length} caption="Accepted upcoming visits" icon={Calendar} tone="blue" />
          <Surface className="p-5">
            <SectionHeader title="Care reminders" />
            <div className="space-y-3">
              {vaccines.map((vaccine) => (
                <div key={vaccine.id} className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3">
                  <div>
                    <p className="font-black text-white">{vaccine.vaccineName}</p>
                    <p className="text-sm text-slate-400">{vaccine.nextDue}</p>
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
  const appointmentsState = useOwnerAppointments();
  const currentUserState = useCurrentUserProfile();
  const petIds = petsState.data.map((pet) => pet.id);
  const recordsState = useOwnerMedicalRecords(petIds);
  const lastVisitByPetId = useMemo(
    () => buildLastVisitByPetId(recordsState.data, appointmentsState.data),
    [recordsState.data, appointmentsState.data],
  );
  const ownerPets = useMemo(
    () => petsState.data.map((pet) => mapPet(pet, { lastVisit: lastVisitByPetId.get(pet.id) ?? null })),
    [petsState.data, lastVisitByPetId],
  );
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
  const petId = params.id ?? petsState.data[0]?.id;
  const petState = usePetById(petId, petsState.data);
  const petRaw = petState.data ?? petsState.data[0];
  const recordsState = usePetMedicalRecords(petRaw?.id);
  const appointmentsState = useOwnerAppointments();
  const vaccinesState = usePetVaccinations(petRaw?.id);
  const lastVisitByPetId = useMemo(
    () => buildLastVisitByPetId(recordsState.data, appointmentsState.data),
    [recordsState.data, appointmentsState.data],
  );
  const pet = petRaw
    ? mapPet(petRaw, { lastVisit: lastVisitByPetId.get(petRaw.id) ?? null })
    : undefined;
  const records = recordsState.data.map(mapMedicalRecord);
  const petAppointments = attachPetPhotosToAppointments(
    appointmentsState.data.filter((a) => a.petId === petRaw?.id).map(mapAppointment),
    petsState.data,
  );
  const petVaccines = vaccinesState.data.map(mapVaccination);
  const [editingPet, setEditingPet] = useState(false);
  const [savingPet, setSavingPet] = useState(false);
  const [petError, setPetError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);

  useEffect(() => {
    setPhotoUrl(petRaw?.photoUrl ?? null);
    setPhotoError(null);
  }, [petRaw?.id, petRaw?.photoUrl]);

  if (!pet) {
    return <EmptyState title="Pet not found" description="This pet profile could not be loaded." />;
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

  const handlePhotoSelect = async (nextPhotoUrl: string) => {
    if (!petRaw) return;
    const ownerId = petRaw.ownerId ?? currentUserState.data.profileId;
    if (!ownerId) {
      setPhotoError('Owner profile is missing. Please sign out and sign in again.');
      return;
    }

    setPhotoUrl(nextPhotoUrl);
    setSavingPhoto(true);
    setPhotoError(null);
    try {
      await petsApi.update(petRaw.id, {
        ownerId,
        speciesId: petRaw.speciesId,
        breedId: petRaw.breedId ?? null,
        name: petRaw.name,
        sex: petRaw.sex,
        birthDate: petRaw.birthDate ?? null,
        weight: petRaw.weight ?? null,
        photoUrl: nextPhotoUrl,
        notes: petRaw.notes ?? null,
      });
      petsState.reload();
      petState.reload();
    } catch (error) {
      setPhotoUrl(petRaw.photoUrl ?? null);
      setPhotoError(formatApiError(error, 'Could not update the pet photo.'));
    } finally {
      setSavingPhoto(false);
    }
  };

  return (
    <DataState loading={petsState.loading || petState.loading} error={petsState.error ?? petState.error}>
    <div className="space-y-6">
      <Surface className="relative overflow-hidden p-6">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-teal-100 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <PetAvatar
              species={pet.species}
              size="xl"
              photoUrl={photoUrl}
              onPhotoSelect={handlePhotoSelect}
              onPhotoError={setPhotoError}
            />
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={pet.healthStatus} />
                <UploadAvatar
                  onChange={handlePhotoSelect}
                  onError={setPhotoError}
                  disabled={savingPhoto}
                />
              </div>
              {photoError ? <p className="mb-2 text-xs font-bold text-rose-600">{photoError}</p> : null}
              <h1 className="text-5xl font-black tracking-[-0.07em] text-white">{pet.name}</h1>
              <p className="mt-2 text-slate-300">{pet.breed} · {pet.age} years · {pet.gender} · {pet.weight}</p>
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
                <div key={vaccine.id} className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-white">{vaccine.vaccineName}</p>
                    <StatusBadge status={vaccine.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">Next due: {vaccine.nextDue}</p>
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
  const ownerAppointments = attachPetPhotosToAppointments(
    appointmentsState.data.map(mapAppointment),
    petsState.data,
  );
  const bookableDoctors = doctorsState.data.filter((doctor) => doctor.isActive);
  const bookingReady = !petsState.loading && !doctorsState.loading && !servicesState.loading;
  const bookingErrorMessage =
    petsState.error ?? doctorsState.error ?? servicesState.error ?? null;
  const [bookingOpen, setBookingOpen] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return ownerAppointments.filter((appointment) => {
      const matchesFilter = activeFilter === 'All' ? true : appointment.status === activeFilter;
      if (!matchesFilter) return false;
      if (!normalizedSearch) return true;

      const searchableText = [
        appointment.petName,
        appointment.doctorName,
        appointment.service,
        appointment.notes,
        appointment.date,
        appointment.time,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [activeFilter, ownerAppointments, searchQuery]);

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
      <FilterBar
        filters={['All', 'Awaiting', 'Accepted', 'Completed', 'Cancelled']}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search appointment, pet, doctor..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="grid gap-4">
        {filteredAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            actions={
              isOpenAppointmentStatus(appointment.status) ? (
                <PrimaryButton variant="secondary" disabled={busyId === appointment.id} onClick={() => cancel(appointment.id, 'Cancelled by owner')}>
                  Cancel visit
                </PrimaryButton>
              ) : undefined
            }
          />
        ))}
      </div>
      {!filteredAppointments.length ? (
        <EmptyState
          title={ownerAppointments.length ? 'No results for current filters' : 'No appointments yet'}
          description={
            ownerAppointments.length
              ? 'Try a different status or search phrase.'
              : 'Book the first visit for one of your pets and it will show up in this timeline.'
          }
          action={<PrimaryButton icon={Plus} disabled={!bookingReady} onClick={openBooking}>Book appointment</PrimaryButton>}
        />
      ) : null}
    </div>
    <AppointmentFormDialog
      open={bookingOpen}
      title="Book appointment"
      description="Choose pet, service and preferred slot. The doctor confirms your request before it becomes Accepted."
      variant="owner"
      pets={petsState.data.map((pet) => ({ id: pet.id, name: pet.name, ownerId: pet.ownerId, ownerName: pet.ownerFullName }))}
      doctors={doctorsState.data}
      rooms={[]}
      services={servicesState.data.map((service) => ({
        id: service.id,
        name: service.name,
        categoryId: service.categoryId,
        categoryName: service.categoryName,
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
  const { confirm, reject, busyId } = useAppointmentActions(() => appointmentsState.reload());
  const doctorAppointments = appointmentsState.data.map(mapAppointment);
  const pendingRequests = doctorAppointments.filter((a) => a.status === 'Awaiting');
  const acceptedAppointments = doctorAppointments.filter((a) => a.status === 'Accepted');
  const quickPets = doctorAppointments.slice(0, 4).map((a) => ({
    id: a.petId,
    name: a.petName,
    species: a.petSpecies,
    breed: a.service,
  }));
  const nextNoteAppointment = appointmentsState.data.find((item) => isOpenAppointmentStatus(mapAppointment(item).status)) ?? appointmentsState.data[0];

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
      {pendingRequests.length > 0 && (
        <Surface className="border border-amber-400/30 bg-amber-500/10 p-5">
          <SectionHeader
            title={`New requests — ${pendingRequests.length} awaiting your response`}
            description="Accept or reject each booking request from clients."
            action={<PrimaryButton variant="secondary" icon={Calendar} onClick={() => navigate('/doctor/appointments')}>All appointments</PrimaryButton>}
          />
          <div className="mt-3 space-y-3">
            {pendingRequests.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                actions={
                  <>
                    <PrimaryButton disabled={busyId === appointment.id} onClick={() => confirm(appointment.id)}>
                      Accept
                    </PrimaryButton>
                    <PrimaryButton variant="secondary" disabled={busyId === appointment.id} onClick={() => reject(appointment.id, 'Rejected by doctor')}>
                      Reject
                    </PrimaryButton>
                  </>
                }
              />
            ))}
          </div>
        </Surface>
      )}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="Accepted — upcoming schedule" action={<PrimaryButton variant="secondary" icon={Calendar} onClick={() => navigate('/doctor/schedule')}>Full schedule</PrimaryButton>} />
            <div className="space-y-3">
              {acceptedAppointments.length ? acceptedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  actions={<PrimaryButton variant="secondary" icon={FileText} onClick={() => navigate(`/doctor/notes/${appointment.id}`)}>Open note</PrimaryButton>}
                />
              )) : <p className="py-4 text-center text-sm text-slate-400">No accepted appointments yet.</p>}
            </div>
          </Surface>
          <Surface className="p-5">
            <SectionHeader title="Pending clinical notes" />
            <div className="grid gap-3 md:grid-cols-2">
              {doctorAppointments.slice(0, 4).map((appointment) => (
                <button key={appointment.id} type="button" onClick={() => navigate(`/doctor/notes/${appointment.id}`)} className="text-left">
                  <InsightItem icon={FileText} tone={appointment.status === 'In progress' ? 'amber' : 'teal'} title={`${appointment.petName} · ${appointment.service}`} description="Open the appointment note and complete the medical record." />
                </button>
              ))}
            </div>
          </Surface>
        </div>
        <div className="space-y-5">
          <MetricCard label="Awaiting response" value={pendingRequests.length} caption="New booking requests" icon={AlertCircle} tone="amber" />
          <MetricCard label="Accepted" value={acceptedAppointments.length} caption="Upcoming confirmed visits" icon={Calendar} tone="teal" />
          <Surface className="p-5">
            <SectionHeader title="Patient quick access" />
            <div className="space-y-3">
              {quickPets.map((pet) => (
                <div key={pet.id} className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3">
                  <PetAvatar species={pet.species} size="sm" photoUrl={pet.photoUrl} />
                  <div>
                    <p className="font-black text-white">{pet.name}</p>
                    <p className="text-sm text-slate-400">{pet.breed}</p>
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

const DOCTOR_SCHEDULE_RANGES = ['Today', 'Week', 'Month'] as const;
type DoctorScheduleRange = (typeof DOCTOR_SCHEDULE_RANGES)[number];

export function RedesignedDoctorSchedule() {
  const appointmentsState = useDoctorAppointments();
  const doctorAppointments = useMemo(() => appointmentsState.data.map(mapAppointment), [appointmentsState.data]);
  const [scheduleRange, setScheduleRange] = useState<DoctorScheduleRange>('Today');
  const [scheduleSearch, setScheduleSearch] = useState('');

  const visibleAppointments = useMemo(() => {
    const now = new Date();
    const startKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    let endKey: number;
    if (scheduleRange === 'Today') {
      endKey = startKey + 86_400_000;
    } else if (scheduleRange === 'Week') {
      endKey = startKey + 7 * 86_400_000;
    } else {
      endKey = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    }
    const search = scheduleSearch.trim().toLowerCase();
    return doctorAppointments.filter((appointment) => {
      const startMs = new Date(appointment.startAt).getTime();
      if (!Number.isFinite(startMs) || startMs < startKey || startMs >= endKey) return false;
      if (!search) return true;
      const haystack = `${appointment.petName} ${appointment.ownerName} ${appointment.service} ${appointment.roomName}`.toLowerCase();
      return haystack.includes(search);
    });
  }, [doctorAppointments, scheduleRange, scheduleSearch]);

  return (
    <DataState loading={appointmentsState.loading} error={appointmentsState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Schedule" title="A visual day plan for real clinical work." description="Timeline blocks, appointment context, quick actions, and a mobile agenda fallback." icon={Calendar} />
      <FilterBar
        filters={[...DOCTOR_SCHEDULE_RANGES]}
        activeFilter={scheduleRange}
        onFilterChange={(value) => setScheduleRange(value as DoctorScheduleRange)}
        searchValue={scheduleSearch}
        onSearchChange={setScheduleSearch}
        searchPlaceholder="Search pet, owner, service, room..."
      />
      <CalendarGrid appointments={visibleAppointments} />
    </div>
    </DataState>
  );
}

const DOCTOR_APPOINTMENT_FILTERS = ['All', 'Awaiting', 'Accepted', 'Completed', 'Cancelled'] as const;
type DoctorAppointmentFilter = (typeof DOCTOR_APPOINTMENT_FILTERS)[number];

export function RedesignedDoctorAppointments() {
  const appointmentsState = useDoctorAppointments();
  const profileState = useCurrentUserProfile();
  const clientsState = useClientsDirectory();
  const petsState = useAllPets();
  const roomsState = useRooms();
  const servicesState = useServices();
  const navigate = useNavigate();
  const { confirm, reject, complete, cancel, busyId } = useAppointmentActions(() => appointmentsState.reload());
  const doctorAppointments = useMemo(() => appointmentsState.data.map(mapAppointment), [appointmentsState.data]);
  const [filter, setFilter] = useState<DoctorAppointmentFilter>('All');
  const [search, setSearch] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const currentDoctorId = profileState.data.profileId ?? appointmentsState.data[0]?.doctorId ?? '';
  const bookingReady =
    Boolean(currentDoctorId)
    && !profileState.loading
    && !clientsState.loading
    && !petsState.loading
    && !roomsState.loading
    && !servicesState.loading;
  const bookingDataError =
    profileState.error ?? clientsState.error ?? petsState.error ?? roomsState.error ?? servicesState.error ?? null;

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return doctorAppointments.filter((appointment) => {
      if (filter !== 'All' && appointment.status !== filter) return false;
      if (!query) return true;
      const haystack = `${appointment.petName} ${appointment.ownerName} ${appointment.service} ${appointment.reason}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [doctorAppointments, filter, search]);

  const openBooking = () => {
    if (!currentDoctorId) {
      setBookingError('Could not detect your doctor profile. Please refresh and try again.');
      return;
    }

    setBookingError(null);
    setBookingOpen(true);
  };

  const handleCreateAppointment = async (body: CreateAppointmentRequest | UpdateAppointmentRequest) => {
    setSavingBooking(true);
    setBookingError(null);
    try {
      await appointmentsApi.create({
        ...(body as CreateAppointmentRequest),
        doctorId: currentDoctorId,
      });
      setBookingOpen(false);
      appointmentsState.reload();
    } catch (error) {
      setBookingError(formatApiError(error, 'Could not create the appointment.'));
    } finally {
      setSavingBooking(false);
    }
  };

  return (
    <DataState loading={appointmentsState.loading} error={appointmentsState.error ?? bookingDataError}>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Doctor appointments"
        title="Clinical queue with patient and owner context."
        description="Time, reason, status, and actions remain visible without table fatigue."
        icon={ClipboardIcon}
        actions={<PrimaryButton icon={Plus} disabled={!bookingReady} onClick={openBooking}>New appointment</PrimaryButton>}
      />
      <FilterBar
        filters={[...DOCTOR_APPOINTMENT_FILTERS]}
        activeFilter={filter}
        onFilterChange={(value) => setFilter(value as DoctorAppointmentFilter)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patient, owner, reason..."
      />
      <div className="grid gap-4">
        {filteredAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            actions={
              <>
                <PrimaryButton variant="secondary" icon={FileText} onClick={() => navigate(`/doctor/notes/${appointment.id}`)}>
                  Open note
                </PrimaryButton>
                {appointment.status === 'Awaiting' ? (
                  <>
                    <PrimaryButton
                      disabled={busyId === appointment.id}
                      onClick={() => confirm(appointment.id)}
                    >
                      Accept
                    </PrimaryButton>
                    <PrimaryButton
                      variant="secondary"
                      disabled={busyId === appointment.id}
                      onClick={() => reject(appointment.id, 'Rejected by doctor')}
                    >
                      Reject
                    </PrimaryButton>
                  </>
                ) : null}
                {appointment.status === 'Accepted' ? (
                  <>
                    <PrimaryButton
                      disabled={busyId === appointment.id}
                      onClick={() => complete(appointment.id)}
                    >
                      Complete
                    </PrimaryButton>
                    <PrimaryButton
                      variant="secondary"
                      disabled={busyId === appointment.id}
                      onClick={() => cancel(appointment.id, 'Cancelled by doctor')}
                    >
                      Cancel
                    </PrimaryButton>
                  </>
                ) : null}
              </>
            }
          />
        ))}
      </div>
      {!filteredAppointments.length ? (
        <EmptyState
          title={doctorAppointments.length ? 'No appointments for current filters' : 'No appointments yet'}
          description={
            doctorAppointments.length
              ? 'Try another status or search phrase.'
              : 'Create an appointment when a client calls the clinic, and it will appear here.'
          }
          action={<PrimaryButton icon={Plus} disabled={!bookingReady} onClick={openBooking}>Create appointment</PrimaryButton>}
        />
      ) : null}
    </div>
    <AppointmentFormDialog
      open={bookingOpen}
      title="Create appointment"
      description="Choose owner, pet, procedure and one of your available slots."
      variant="doctor"
      fixedDoctorId={currentDoctorId}
      pets={petsState.data.map((pet) => ({ id: pet.id, name: pet.name, ownerId: pet.ownerId, ownerName: pet.ownerFullName }))}
      clients={clientsState.data}
      doctors={[]}
      rooms={roomsState.data.map((room) => ({ id: room.id, name: room.name }))}
      services={servicesState.data.map((service) => ({
        id: service.id,
        name: service.name,
        categoryId: service.categoryId,
        categoryName: service.categoryName,
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
        <PageHeader eyebrow="Medical notes" title="Clinical documentation that feels structured, not cramped." description="Open a scheduled appointment and save straight into the medical record." icon={HeartPulse} />
        <EmptyState
          title="Select a real appointment"
          description="Open a medical note from a live appointment to create or update the clinical record."
        />
      </div>
    );
  }

  const handleSave = async (body: CreateMedicalRecordRequest | UpdateMedicalRecordRequest) => {
    if (!recordState.data && appointmentView?.status !== 'Completed') {
      setActionError('Complete the visit before saving a medical note.');
      return;
    }

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
      if (appointmentView?.status !== 'Completed') {
        await appointmentsApi.complete(params.id);
      }

      if (recordState.data) {
        await medicalRecordsApi.update(recordState.data.id, body as UpdateMedicalRecordRequest);
      } else {
        await medicalRecordsApi.create(body as CreateMedicalRecordRequest);
      }
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
            <SectionHeader title="Appointment context" description="Appointment data linked to the active medical record." />
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Patient</p>
                <p className="mt-1 font-black text-white">{appointmentView.petName}</p>
                <p className="text-sm text-slate-400">{appointmentView.petSpecies}</p>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Visit</p>
                <p className="mt-1 font-black text-white">{appointmentView.service}</p>
                <p className="text-sm text-slate-400">{appointmentView.date} at {appointmentView.time}</p>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Doctor</p>
                <p className="mt-1 font-black text-white">{appointmentView.doctorName}</p>
                <p className="text-sm text-slate-400">{appointmentView.status}</p>
              </div>
              {appointmentView.notes ? (
                <div className="flex items-start gap-2 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-amber-300" />
                  <span>{appointmentView.notes}</span>
                </div>
              ) : null}
            </div>
          </Surface>
          <MedicalRecordEditor
            record={recordState.data}
            appointmentId={params.id}
            appointmentStatus={appointmentView.status}
            loading={saving}
            error={actionError}
            onSave={handleSave}
            onComplete={handleComplete}
          />
        </div>
      ) : (
        <EmptyState
          title="Appointment not found"
          description="Open an appointment from the schedule to write its medical note."
        />
      )}
    </div>
    </DataState>
  );
}

export function RedesignedAdminDashboard() {
  const appointmentsState = useAdminAppointments();
  const doctorsState = useDoctors(true);
  const navigate = useNavigate();
  const allAppointments = appointmentsState.data.map(mapAppointment);
  const todayKey = new Date().toDateString();
  const todayAppointments = allAppointments.filter((a) => new Date(a.startAt).toDateString() === todayKey || isOpenAppointmentStatus(a.status));
  const pendingAppointments = allAppointments.filter((a) => a.status === 'Awaiting');
  const doctorViews = doctorsState.data.map((d) => mapDoctor(d, appointmentsState.data));
  const { confirm, reject, busyId: actionBusyId } = useAppointmentActions(() => appointmentsState.reload());

  return (
    <DataState loading={appointmentsState.loading || doctorsState.loading} error={appointmentsState.error ?? doctorsState.error}>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clinic operations"
        title="Today’s clinic pulse, without analytics overload."
        description="Operational status, urgent items, doctor availability, and quick actions live here. Trends moved to Insights."
        icon={ShieldCheck}
        actions={
          <PrimaryButton variant="secondary" icon={Calendar} onClick={() => navigate('/admin/appointments')}>
            Go to appointments
          </PrimaryButton>
        }
      />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Visits today" value={todayAppointments.length} caption="Across all rooms" icon={Calendar} tone="teal" />
        <MetricCard label="Awaiting" value={pendingAppointments.length} caption="Need doctor response" icon={AlertCircle} tone="amber" />
        <MetricCard label="Doctors active" value={doctorViews.filter((doctor) => doctor.status !== 'Off duty').length} caption="Ready for visits" icon={Stethoscope} tone="blue" />
        <MetricCard label="Open visits" value={allAppointments.filter((a) => isOpenAppointmentStatus(a.status)).length} caption="Accepted upcoming" icon={CheckCircle2} tone="teal" />
      </div>
      {pendingAppointments.length > 0 && (
        <Surface className="border border-amber-400/30 bg-amber-500/10 p-5">
          <SectionHeader
            title={`${pendingAppointments.length} unconfirmed request${pendingAppointments.length > 1 ? 's' : ''}`}
            description="These bookings are waiting for a doctor to accept or reject them."
          />
          <div className="mt-3 space-y-3">
            {pendingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                actions={
                  <>
                    <PrimaryButton disabled={actionBusyId === appointment.id} onClick={() => confirm(appointment.id)}>
                      Accept
                    </PrimaryButton>
                    <PrimaryButton variant="secondary" disabled={actionBusyId === appointment.id} onClick={() => reject(appointment.id)}>
                      Reject
                    </PrimaryButton>
                  </>
                }
              />
            ))}
          </div>
        </Surface>
      )}
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
                <div key={doctor.id} className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3">
                  <div>
                    <p className="font-black text-white">{doctor.name}</p>
                    <p className="text-sm text-slate-400">{doctor.specialization}</p>
                  </div>
                  <StatusBadge status={doctor.status} />
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

type CalendarRange = 'day' | 'week' | 'month';

const CALENDAR_RANGE_LABELS: Record<CalendarRange, string> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
};

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const day = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - day);
  return next;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function shiftRange(range: CalendarRange, anchor: Date, direction: number): Date {
  const next = new Date(anchor);
  if (range === 'day') {
    next.setDate(next.getDate() + direction);
  } else if (range === 'week') {
    next.setDate(next.getDate() + direction * 7);
  } else {
    next.setMonth(next.getMonth() + direction);
  }
  return next;
}

function rangeBoundaries(range: CalendarRange, anchor: Date): { from: Date; to: Date } {
  if (range === 'day') return { from: startOfDay(anchor), to: endOfDay(anchor) };
  if (range === 'week') {
    const from = startOfWeek(anchor);
    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    return { from, to: endOfDay(to) };
  }
  return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
}

function formatRangeLabel(range: CalendarRange, anchor: Date): string {
  if (range === 'day') {
    return anchor.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (range === 'week') {
    const { from, to } = rangeBoundaries('week', anchor);
    const sameMonth = from.getMonth() === to.getMonth();
    const fromLabel = from.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const toLabel = to.toLocaleDateString(undefined, sameMonth ? { day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fromLabel} – ${toLabel}`;
  }
  return anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

const CALENDAR_STATUS_FILTERS = ['All', 'Awaiting', 'Accepted', 'Completed', 'Cancelled'] as const;
type CalendarStatusFilter = (typeof CALENDAR_STATUS_FILTERS)[number];

export function RedesignedClinicCalendar() {
  const [range, setRange] = useState<CalendarRange>('day');
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());
  const [statusFilter, setStatusFilter] = useState<CalendarStatusFilter>('All');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const boundaries = useMemo(() => rangeBoundaries(range, anchorDate), [range, anchorDate]);
  const appointmentsState = useAdminAppointments(boundaries.from.toISOString(), boundaries.to.toISOString());
  const doctorsState = useDoctors(true);
  const petsState = useAllPets();
  const allAppointments = useMemo(
    () => attachPetPhotosToAppointments(
      appointmentsState.data.map(mapAppointment),
      petsState.data,
    ),
    [appointmentsState.data, petsState.data],
  );

  const filteredAppointments = useMemo(() => {
    const fromMs = boundaries.from.getTime();
    const toMs = boundaries.to.getTime();
    const search = searchQuery.trim().toLowerCase();
    return allAppointments.filter((appointment) => {
      const startMs = new Date(appointment.startAt).getTime();
      if (Number.isNaN(startMs) || startMs < fromMs || startMs > toMs) return false;
      if (statusFilter !== 'All' && appointment.status !== statusFilter) return false;
      if (doctorFilter !== 'all' && appointment.doctorId !== doctorFilter) return false;
      if (roomFilter !== 'all' && appointment.roomId !== roomFilter) return false;
      if (search) {
        const haystack = `${appointment.petName} ${appointment.ownerName} ${appointment.doctorName} ${appointment.service} ${appointment.roomName}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [allAppointments, boundaries.from, boundaries.to, statusFilter, doctorFilter, roomFilter, searchQuery]);

  const selectedAppointment = filteredAppointments.find((appointment) => appointment.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && !selectedAppointment) {
      setSelectedId(null);
      setDetailDialogOpen(false);
    }
  }, [selectedId, selectedAppointment]);

  const roomOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const appointment of allAppointments) {
      if (appointment.roomId && !map.has(appointment.roomId)) map.set(appointment.roomId, appointment.roomName);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allAppointments]);

  return (
    <DataState loading={appointmentsState.loading || doctorsState.loading} error={appointmentsState.error ?? doctorsState.error}>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clinic calendar"
        title="Multi-doctor, multi-room calendar for real clinic operations."
        description="Switch between day, week and month, jump between dates, and filter by doctor, room or status. Same-time visits in different rooms render as separate blocks."
        icon={Calendar}
      />

      <Surface className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(CALENDAR_RANGE_LABELS) as CalendarRange[]).map((rangeOption) => (
              <button
                key={rangeOption}
                type="button"
                onClick={() => setRange(rangeOption)}
                className={`rounded-2xl border px-3 py-2 text-xs font-bold transition ${
                  rangeOption === range
                    ? 'border-teal-200 bg-teal-600 text-white shadow-lg shadow-teal-600/15'
                    : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {CALENDAR_RANGE_LABELS[rangeOption]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAnchorDate((current) => shiftRange(range, current, -1))}
              className="rounded-2xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
            >
              ‹ Prev
            </button>
            <button
              type="button"
              onClick={() => setAnchorDate(new Date())}
              className="rounded-2xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setAnchorDate((current) => shiftRange(range, current, 1))}
              className="rounded-2xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
            >
              Next ›
            </button>
            <input
              type="date"
              value={formatDateInput(anchorDate)}
              onChange={(event) => {
                if (!event.target.value) return;
                const [year, month, day] = event.target.value.split('-').map(Number);
                setAnchorDate(new Date(year, (month || 1) - 1, day || 1));
              }}
              className="h-10 rounded-2xl border border-slate-700 bg-slate-950 px-3 text-xs font-bold text-slate-100 outline-none focus:border-teal-400/60"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm font-black text-white">{formatRangeLabel(range, anchorDate)}</p>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
            {filteredAppointments.length} appointment{filteredAppointments.length === 1 ? '' : 's'}
          </span>
        </div>
      </Surface>

      <Surface className="p-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <FormSelect
            label="Doctor"
            value={doctorFilter}
            onChange={(value) => setDoctorFilter(value)}
            options={[
              { value: 'all', label: 'All doctors' },
              ...doctorsState.data.map((doctor) => ({
                value: doctor.id,
                label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
              })),
            ]}
          />
          <FormSelect
            label="Room"
            value={roomFilter}
            onChange={(value) => setRoomFilter(value)}
            options={[
              { value: 'all', label: 'All rooms' },
              ...roomOptions.map((room) => ({ value: room.id, label: room.name })),
            ]}
          />
        </div>
      </Surface>

      <FilterBar
        filters={[...CALENDAR_STATUS_FILTERS]}
        activeFilter={statusFilter}
        onFilterChange={(value) => setStatusFilter(value as CalendarStatusFilter)}
        searchPlaceholder="Search pet, owner, doctor, room..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div>
        <CalendarGrid
          appointments={filteredAppointments}
          range={range}
          onSelect={(appointmentId) => {
            setSelectedId(appointmentId);
            setDetailDialogOpen(true);
          }}
          selectedId={selectedAppointment?.id ?? null}
        />
      </div>

      <FormDialog
        open={detailDialogOpen && Boolean(selectedAppointment)}
        title="Appointment details"
        description="Visit snapshot from the clinic calendar."
        onClose={() => setDetailDialogOpen(false)}
        widthClassName="max-w-xl"
      >
        {selectedAppointment ? (
          <AppointmentCard appointment={selectedAppointment} compact />
        ) : (
          <EmptyState
            title="No appointment selected"
            description="Pick a slot from the calendar to inspect visit details."
          />
        )}
      </FormDialog>
    </div>
    </DataState>
  );
}

const APPOINTMENT_STATUS_FILTERS = ['All', 'Awaiting', 'Accepted', 'Completed', 'Cancelled'] as const;
type AppointmentStatusFilter = (typeof APPOINTMENT_STATUS_FILTERS)[number];

export function RedesignedAppointmentManagement() {
  const appointmentsState = useAdminAppointments();
  const petsState = useAllPets();
  const doctorsState = useDoctors(true);
  const servicesState = useServices();
  const roomsState = useRooms();
  const clientsState = useClientsDirectory();
  const { cancel, complete, confirm, reject, busyId } = useAppointmentActions(() => appointmentsState.reload());
  const allAppointments = useMemo(
    () => attachPetPhotosToAppointments(
      appointmentsState.data.map(mapAppointment),
      petsState.data,
    ),
    [appointmentsState.data, petsState.data],
  );
  const [editingAppointment, setEditingAppointment] = useState<AppointmentResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailAppointmentId, setDetailAppointmentId] = useState<string | null>(null);

  const filteredAppointments = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    return allAppointments.filter((appointment) => {
      if (statusFilter !== 'All' && appointment.status !== statusFilter) return false;
      if (!search) return true;
      const haystack = `${appointment.petName} ${appointment.ownerName} ${appointment.doctorName} ${appointment.service} ${appointment.roomName}`.toLowerCase();
      return haystack.includes(search);
    });
  }, [allAppointments, statusFilter, searchQuery]);

  const detailAppointment = appointmentsState.data.find((item) => item.id === detailAppointmentId) ?? null;

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
    <DataState
      loading={appointmentsState.loading || petsState.loading || doctorsState.loading || servicesState.loading || roomsState.loading || clientsState.loading}
      error={appointmentsState.error ?? petsState.error ?? doctorsState.error ?? servicesState.error ?? roomsState.error ?? clientsState.error}
    >
    <div className="space-y-6">
      <PageHeader
        eyebrow="Appointment management"
        title="A powerful queue without unnecessary charts."
        description="Searchable, filterable, status-aware management view with edit/cancel/complete actions. Click any row to inspect pet, owner and guarantor details."
        icon={Calendar}
        actions={<PrimaryButton icon={Plus} onClick={openCreate}>Create appointment</PrimaryButton>}
      />
      <FilterBar
        filters={[...APPOINTMENT_STATUS_FILTERS]}
        activeFilter={statusFilter}
        onFilterChange={(value) => setStatusFilter(value as AppointmentStatusFilter)}
        searchPlaceholder="Search appointment, owner, pet, doctor, room..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <Surface className="overflow-hidden">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[110px]" />
              <col className="w-[170px]" />
              <col className="w-[140px]" />
              <col className="w-[150px]" />
              <col className="w-[120px]" />
              <col className="w-[140px]" />
              <col className="w-[120px]" />
              <col />
            </colgroup>
            <thead className="bg-slate-900/70">
              <tr>
                {['Time', 'Pet', 'Owner', 'Doctor', 'Room', 'Service', 'Status', 'Actions'].map((head) => (
                  <th key={head} className="px-3 py-3 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAppointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="cursor-pointer transition hover:bg-teal-500/5"
                  onClick={() => setDetailAppointmentId(appointment.id)}
                >
                  <td className="px-3 py-3 align-middle">
                    <p className="text-xs font-bold text-slate-300">{appointment.date}</p>
                    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">{appointment.time}</p>
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <PetAvatar species={appointment.petSpecies} size="sm" />
                      <span className="min-w-0 break-words text-sm font-bold text-slate-100">{appointment.petName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-middle break-words text-sm text-slate-200">{appointment.ownerName}</td>
                  <td className="px-3 py-3 align-middle break-words text-sm text-slate-200">{appointment.doctorName}</td>
                  <td className="px-3 py-3 align-middle break-words text-sm text-slate-300">{appointment.roomName || '—'}</td>
                  <td className="px-3 py-3 align-middle break-words text-sm text-slate-200">{appointment.service}</td>
                  <td className="px-3 py-3 align-middle"><StatusBadge status={appointment.status} /></td>
                  <td className="px-3 py-3 align-middle" onClick={(event) => event.stopPropagation()}>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => openEdit(appointment.id)} className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-800">Edit</button>
                      {appointment.status === 'Awaiting' && (
                        <>
                          <button disabled={busyId === appointment.id} onClick={() => confirm(appointment.id)} className="rounded-xl border border-teal-400/40 bg-teal-500/10 px-2.5 py-1 text-[11px] font-bold text-teal-200 hover:bg-teal-500/20">Accept</button>
                          <button disabled={busyId === appointment.id} onClick={() => reject(appointment.id)} className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-200 hover:bg-rose-500/20">Reject</button>
                        </>
                      )}
                      {appointment.status === 'Accepted' && (
                        <>
                          <button disabled={busyId === appointment.id} onClick={() => complete(appointment.id)} className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-800">Complete</button>
                          <button disabled={busyId === appointment.id} onClick={() => cancel(appointment.id)} className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-800">Cancel</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredAppointments.length ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-slate-400">
                    No appointments match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-4 lg:hidden">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              compact
              onClick={() => setDetailAppointmentId(appointment.id)}
              actions={<PrimaryButton variant="secondary" icon={Edit3} onClick={() => openEdit(appointment.id)}>Edit</PrimaryButton>}
            />
          ))}
        </div>
      </Surface>
    </div>
    <AppointmentFormDialog
      open={dialogOpen}
      title={editingAppointment ? 'Edit appointment' : 'Create appointment'}
      description="Manage visit timing, room, doctor and procedure from the admin queue."
      appointment={editingAppointment}
      pets={petsState.data.map((pet) => ({
        id: pet.id,
        name: pet.name,
        ownerId: pet.ownerId,
        ownerName: pet.ownerFullName,
      }))}
      clients={clientsState.data.map((client) => ({
        ownerId: client.ownerId,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
      }))}
      doctors={doctorsState.data}
      rooms={roomsState.data.map((room) => ({ id: room.id, name: room.name }))}
      services={servicesState.data.map((service) => ({
        id: service.id,
        name: service.name,
        categoryId: service.categoryId,
        categoryName: service.categoryName,
        durationMinutes: service.durationMinutes,
      }))}
      loading={saving}
      error={actionError}
      onClose={() => setDialogOpen(false)}
      onSubmit={handleSaveAppointment}
    />
    <AppointmentDetailDialog
      appointment={detailAppointment}
      pets={petsState.data}
      clients={clientsState.data}
      onClose={() => setDetailAppointmentId(null)}
      onEdit={(appointmentId) => {
        setDetailAppointmentId(null);
        openEdit(appointmentId);
      }}
    />
    </DataState>
  );
}

export function RedesignedDoctorManagement() {
  const { user } = useAuth();
  const doctorsState = useDoctors(true);
  const appointmentsState = useAdminAppointments();
  const specializationsState = useSpecializations(false);
  const doctorViews = doctorsState.data.map((d) => mapDoctor(d, appointmentsState.data));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorStatusFilter, setDoctorStatusFilter] = useState('All');

  const doctorStatusFilters = useMemo(() => {
    const base = ['All', 'Available', 'Off duty'];
    const specSet = new Set<string>();
    for (const doctor of doctorsState.data) {
      for (const spec of doctor.specializations) {
        if (spec.isActive) specSet.add(spec.name);
      }
    }
    return [...base, ...Array.from(specSet).sort()];
  }, [doctorsState.data]);

  const filteredDoctorViews = useMemo(() => {
    const search = doctorSearch.trim().toLowerCase();
    return doctorViews.filter((doctor) => {
      const source = doctorsState.data.find((item) => item.id === doctor.id);
      const specs = source?.specializations.map((spec) => spec.name) ?? [doctor.specialization];
      if (doctorStatusFilter !== 'All') {
        const matchesStatus = doctorStatusFilter === doctor.status || specs.includes(doctorStatusFilter);
        if (!matchesStatus) return false;
      }
      if (!search) return true;
      const haystack = `${doctor.name} ${doctor.email} ${specs.join(' ')}`.toLowerCase();
      return haystack.includes(search);
    });
  }, [doctorViews, doctorsState.data, doctorSearch, doctorStatusFilter]);

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

  const handleUpdateDoctor = async (body: { firstName: string; lastName: string; bio: string; isActive: boolean; experienceYears: number | null; specializationIds: string[] }) => {
    if (!editingDoctor) return;
    setSaving(true);
    setActionError(null);
    try {
      await doctorsApi.update(editingDoctor.id, {
        firstName: body.firstName,
        lastName: body.lastName,
        bio: body.bio || null,
        photoUrl: editingDoctor.photoUrl ?? null,
        experienceYears: body.experienceYears,
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
      <FilterBar
        filters={doctorStatusFilters}
        activeFilter={doctorStatusFilter}
        onFilterChange={setDoctorStatusFilter}
        searchValue={doctorSearch}
        onSearchChange={setDoctorSearch}
        searchPlaceholder="Search doctor, email, specialization..."
      />
      {filteredDoctorViews.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctorViews.map((doctor) => (
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
      ) : (
        <EmptyState
          title="No doctors match your filters"
          description="Try a different search term or status."
        />
      )}
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
            <thead className="bg-slate-900/70">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map((head) => (
                  <th key={head} className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
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
                  <tr key={member.userId} className="transition hover:bg-teal-500/5">
                    <td className="px-5 py-4 font-black text-white">{member.firstName} {member.lastName}</td>
                    <td className="px-5 py-4 text-slate-300">{member.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs font-black text-teal-200">
                        {roleLabel(target.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {member.isProtected ? (
                        <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-200">Protected</span>
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
                          className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-500/20"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-500">Cannot remove</span>
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

const CLIENT_FILTERS = ['All clients', 'Multiple pets', 'No pets', 'Has visits'] as const;
type ClientFilter = (typeof CLIENT_FILTERS)[number];

export function RedesignedClientsManagement() {
  const clientsState = useClientsDirectory();
  const [filter, setFilter] = useState<ClientFilter>('All clients');
  const [search, setSearch] = useState('');

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    return clientsState.data.filter((client) => {
      if (filter === 'Multiple pets' && client.petsCount < 2) return false;
      if (filter === 'No pets' && client.petsCount > 0) return false;
      if (filter === 'Has visits' && !client.lastAppointmentAt) return false;
      if (!query) return true;
      const haystack = `${client.firstName} ${client.lastName} ${client.email} ${client.phone ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [clientsState.data, filter, search]);

  const clients = filteredClients.map((c) => ({
    name: `${c.firstName} ${c.lastName}`,
    phone: c.phone ?? c.email,
    petsCount: c.petsCount,
    lastAppointment: formatDate(c.lastAppointmentAt),
  }));

  return (
    <DataState loading={clientsState.loading} error={clientsState.error}>
    <div className="space-y-6">
      <PageHeader eyebrow="Clients" title="Client relationships, pets, and follow-up context." description="A polished working client directory with contact info, pet counts, last appointment, and follow-up context. New client creation currently comes from the public registration flow." icon={Users} />
      <FilterBar
        filters={[...CLIENT_FILTERS]}
        activeFilter={filter}
        onFilterChange={(value) => setFilter(value as ClientFilter)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, phone..."
      />
      {clients.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {clients.map((client) => <ClientCard key={`${client.name}-${client.phone}`} {...client} />)}
        </div>
      ) : (
        <EmptyState
          title="No clients match your search"
          description="Adjust filters or clear the search input."
        />
      )}
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
            <span className="mb-2 block text-sm font-bold text-slate-200">{field}</span>
            <input disabled={disabled} className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-500/10 disabled:opacity-60" placeholder={field} />
          </label>
        ))}
      </div>
    </Surface>
  );
}

export function RedesignedProfilePage() {
  const { user, refreshUser } = useAuth();
  const initials = `${user!.firstName.charAt(0)}${user!.lastName.charAt(0) || user!.firstName.charAt(1) || ''}`.toUpperCase();
  const [profileDraft, setProfileDraft] = useState({
    firstName: user!.firstName,
    lastName: user!.lastName,
    photoUrl: user!.photoUrl ?? null,
  });
  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    appointmentReminders: true,
    medicalRecordUpdates: true,
    clinicAnnouncements: true,
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    setProfileDraft({
      firstName: user!.firstName,
      lastName: user!.lastName,
      photoUrl: user!.photoUrl ?? null,
    });
  }, [user]);

  useEffect(() => {
    authApi.me()
      .then((me) => {
        setProfileDraft((prev) => ({ ...prev, photoUrl: me.photoUrl ?? prev.photoUrl }));
        setNotificationPrefs(me.notificationPreferences);
      })
      .catch((error) => setNotificationError(formatApiError(error, 'Could not load notification settings.')));
  }, []);

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstNameError = validateName(profileDraft.firstName, 'First name');
    const lastNameError = validateName(profileDraft.lastName, 'Last name');
    if (firstNameError || lastNameError) {
      setProfileError(firstNameError ?? lastNameError);
      return;
    }

    setSavingProfile(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      await authApi.updateProfile({
        firstName: profileDraft.firstName.trim(),
        lastName: profileDraft.lastName.trim(),
        photoUrl: profileDraft.photoUrl,
      });
      await refreshUser();
      setProfileMessage('Profile saved.');
    } catch (error) {
      setProfileError(formatApiError(error, 'Could not save profile changes.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarSelect = async (photoUrl: string) => {
    setProfileDraft((prev) => ({ ...prev, photoUrl }));
    setAvatarError(null);
    try {
      await authApi.updateProfile({
        firstName: profileDraft.firstName.trim(),
        lastName: profileDraft.lastName.trim(),
        photoUrl,
      });
      await refreshUser();
      setProfileMessage('Avatar saved.');
    } catch (error) {
      setAvatarError(formatApiError(error, 'Could not save avatar.'));
    }
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const passwordErrorText = validatePassword(passwordDraft.newPassword);
    if (passwordErrorText) {
      setPasswordError(passwordErrorText);
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);
    setPasswordMessage(null);
    try {
      await authApi.changePassword(passwordDraft);
      setPasswordDraft({ currentPassword: '', newPassword: '' });
      setPasswordMessage('Password changed.');
    } catch (error) {
      setPasswordError(formatApiError(error, 'Could not change password.'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notificationPrefs, checked: boolean) => {
    const previousPrefs = { ...notificationPrefs };
    const nextPrefs = { ...notificationPrefs, [key]: checked };
    setNotificationPrefs(nextPrefs);
    setSavingNotifications(true);
    setNotificationError(null);
    try {
      const saved = await authApi.updateNotificationPreferences(nextPrefs);
      setNotificationPrefs(saved);
    } catch (error) {
      setNotificationPrefs(previousPrefs);
      setNotificationError(formatApiError(error, 'Could not save notification settings.'));
    } finally {
      setSavingNotifications(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Profile & account" title="Your VetVik account" description="Manage your personal information, security settings, and notifications." icon={Users} />
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Surface className="p-6 text-center">
          <GalleryImagePicker onSelect={handleAvatarSelect} onError={setAvatarError}>
            {(open) => (
              <button
                type="button"
                onClick={open}
                className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-400 to-amber-300 text-2xl font-black text-white shadow-xl"
              >
                {profileDraft.photoUrl ? (
                  <img src={profileDraft.photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </button>
            )}
          </GalleryImagePicker>
          <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] text-white">{profileDraft.firstName} {profileDraft.lastName}</h2>
          <p className="text-sm text-slate-400">{roleLabel(user!.role)}</p>
          <div className="mt-5">
            <UploadAvatar label="Choose from gallery" onChange={handleAvatarSelect} onError={setAvatarError} />
          </div>
          {avatarError ? <p className="mt-3 text-xs font-bold text-rose-600">{avatarError}</p> : null}
        </Surface>
        <div className="space-y-5">
          <Surface className="p-5">
            <SectionHeader title="My Profile" description="Update the profile shown across VetVik." />
            <form onSubmit={handleSaveProfile} className="mt-4">
              <FormGrid columns={2}>
                <FormField label="First name" value={profileDraft.firstName} onChange={(value) => setProfileDraft((prev) => ({ ...prev, firstName: value }))} />
                <FormField label="Last name" value={profileDraft.lastName} onChange={(value) => setProfileDraft((prev) => ({ ...prev, lastName: value }))} />
                <FormField label="Email" type="email" value={user!.email} onChange={() => undefined} disabled />
                <FormField label="Role" value={roleLabel(user!.role)} onChange={() => undefined} disabled />
              </FormGrid>
              <FormErrorMessage message={profileError} />
              {profileMessage ? <p className="mt-4 rounded-2xl bg-teal-500/10 px-4 py-3 text-sm font-bold text-teal-300">{profileMessage}</p> : null}
              <div className="mt-5 flex justify-end">
                <PrimaryButton type="submit" icon={Save} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save profile'}
                </PrimaryButton>
              </div>
            </form>
          </Surface>
          <Surface className="p-5">
            <SectionHeader title="Security" description="Change your account password." />
            <form onSubmit={handleChangePassword} className="mt-4">
              <FormGrid columns={2}>
                <FormField label="Current password" type="password" value={passwordDraft.currentPassword} onChange={(value) => setPasswordDraft((prev) => ({ ...prev, currentPassword: value }))} />
                <FormField label="New password" type="password" value={passwordDraft.newPassword} onChange={(value) => setPasswordDraft((prev) => ({ ...prev, newPassword: value }))} />
              </FormGrid>
              <FormErrorMessage message={passwordError} />
              {passwordMessage ? <p className="mt-4 rounded-2xl bg-teal-500/10 px-4 py-3 text-sm font-bold text-teal-300">{passwordMessage}</p> : null}
              <div className="mt-5 flex justify-end">
                <PrimaryButton type="submit" icon={Save} disabled={savingPassword}>
                  {savingPassword ? 'Changing...' : 'Change password'}
                </PrimaryButton>
              </div>
            </form>
          </Surface>
          <Surface className="p-5">
            <SectionHeader title="Notifications" />
            <div className="mt-4 grid gap-3">
              <FormSwitchRow label="Appointment reminders" checked={notificationPrefs.appointmentReminders} onChange={(checked) => handleNotificationChange('appointmentReminders', checked)} />
              <FormSwitchRow label="Medical record updates" checked={notificationPrefs.medicalRecordUpdates} onChange={(checked) => handleNotificationChange('medicalRecordUpdates', checked)} />
              <FormSwitchRow label="Clinic announcements" checked={notificationPrefs.clinicAnnouncements} onChange={(checked) => handleNotificationChange('clinicAnnouncements', checked)} />
            </div>
            {savingNotifications ? <p className="mt-3 text-sm font-bold text-slate-400">Saving...</p> : null}
            <FormErrorMessage message={notificationError} />
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
  const doctorViews = doctorsState.data.map((d) => mapDoctor(d, appointmentsState.data));
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
            <BarChart data={doctorViews.map((doctor) => ({ name: doctor.name.replace('Dr. ', ''), visits: doctor.totalAppointments }))}>
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
            {speciesData.map((item) => <div key={item.name} className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3 text-sm font-bold text-slate-300">{item.name}: {item.value}%</div>)}
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
              title="No insights yet"
              description="Operational recommendations will appear here when there is enough clinic activity."
            />
          </div>
        </Surface>
      </div>
    </div>
    </DataState>
  );
}
