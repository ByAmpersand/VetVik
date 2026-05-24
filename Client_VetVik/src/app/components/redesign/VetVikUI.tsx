import { useEffect, useState, type ElementType, type ReactNode } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DoorOpen,
  FileText,
  PawPrint,
  Search,
  Sparkles,
  Stethoscope,
  Upload,
  UserRound,
} from 'lucide-react';
import { petSpeciesEmoji } from '../../data/formatters';
import { GalleryImagePicker } from './GalleryImagePicker';

type Tone = 'teal' | 'blue' | 'amber' | 'coral' | 'slate' | 'green' | 'red' | 'purple';

const toneMap: Record<Tone, string> = {
  teal: 'border-teal-400/25 bg-teal-400/12 text-teal-100',
  blue: 'border-sky-400/25 bg-sky-400/12 text-sky-100',
  amber: 'border-amber-300/25 bg-amber-300/14 text-amber-100',
  coral: 'border-rose-300/25 bg-rose-400/12 text-rose-100',
  slate: 'border-slate-500/30 bg-slate-800/80 text-slate-100',
  green: 'border-emerald-400/25 bg-emerald-400/12 text-emerald-100',
  red: 'border-red-400/25 bg-red-400/12 text-red-100',
  purple: 'border-violet-400/25 bg-violet-400/12 text-violet-100',
};

const iconToneMap: Record<Tone, string> = {
  teal: 'bg-teal-500 text-white shadow-teal-500/25',
  blue: 'bg-sky-500 text-white shadow-sky-500/25',
  amber: 'bg-amber-400 text-amber-950 shadow-amber-400/25',
  coral: 'bg-rose-400 text-white shadow-rose-400/25',
  slate: 'bg-slate-800 text-white shadow-slate-800/20',
  green: 'bg-emerald-500 text-white shadow-emerald-500/25',
  red: 'bg-red-500 text-white shadow-red-500/25',
  purple: 'bg-violet-500 text-white shadow-violet-500/25',
};

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Surface({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-slate-700/70 bg-slate-900/92 shadow-[0_22px_80px_rgba(0,0,0,0.32)]',
        interactive && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400/35 hover:bg-slate-900 hover:shadow-[0_28px_90px_rgba(0,0,0,0.42)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon = PawPrint,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ElementType;
  actions?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-700/70 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_35%),linear-gradient(135deg,#0f172a_0%,#102a35_52%,#08111f_100%)] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-amber-300/15 blur-2xl" />
      <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-sky-400/15 blur-2xl" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-100 shadow-sm">
            <Icon className="h-3.5 w-3.5" />
            {eyebrow ?? 'VetVik clinic'}
          </div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="break-words text-lg font-black tracking-[-0.02em] text-white">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  icon: Icon,
  variant = 'primary',
  type = 'button',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: ElementType;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const styles = {
    primary: 'bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700',
    secondary: 'border border-teal-300/25 bg-teal-400/10 text-teal-100 hover:bg-teal-400/18',
    ghost: 'bg-slate-800/70 text-slate-200 hover:bg-slate-700',
    dark: 'bg-slate-100 text-slate-950 shadow-lg shadow-black/20 hover:bg-white',
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn('inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font800 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60', styles)}
      style={{ fontWeight: 800 }}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'Completed' || status === 'Available' || status === 'Healthy' || status === 'Up to date'
      ? 'green'
      : status === 'Cancelled' || status === 'Overdue'
        ? 'red'
        : status === 'Awaiting' || status === 'In progress' || status === 'Busy' || status === 'Due soon' || status === 'Needs Attention'
          ? 'amber'
          : status === 'Under Treatment'
            ? 'blue'
            : 'teal';

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold', toneMap[tone])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function SearchInput({
  placeholder = 'Search VetVik...',
  value = '',
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/70 pl-11 pr-4 text-sm text-slate-100 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-500/10"
      />
    </div>
  );
}

export function FilterBar({
  filters,
  searchPlaceholder,
  searchValue = '',
  activeFilter,
  onSearchChange,
  onFilterChange,
}: {
  filters: string[];
  searchPlaceholder?: string;
  searchValue?: string;
  activeFilter?: string;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (value: string) => void;
}) {
  const [internalFilter, setInternalFilter] = useState(activeFilter ?? filters[0] ?? '');

  useEffect(() => {
    if (typeof activeFilter === 'string') {
      setInternalFilter(activeFilter);
      return;
    }
    setInternalFilter((current) => (filters.includes(current) ? current : (filters[0] ?? '')));
  }, [activeFilter, filters]);

  const selectedFilter = activeFilter ?? internalFilter;

  return (
    <Surface className="p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput placeholder={searchPlaceholder} value={searchValue} onChange={onSearchChange} />
        <div className="flex flex-wrap gap-2 lg:flex-nowrap">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                if (typeof activeFilter !== 'string') {
                  setInternalFilter(filter);
                }
                onFilterChange?.(filter);
              }}
              className={cn(
                'cursor-pointer rounded-2xl border px-3 py-2 text-xs font-bold transition',
                filter === selectedFilter
                  ? 'border-teal-200 bg-teal-600 text-white shadow-lg shadow-teal-600/15'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white',
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </Surface>
  );
}

export function MetricCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = 'teal',
}: {
  label: string;
  value: string | number;
  caption?: string;
  icon: ElementType;
  tone?: Tone;
}) {
  return (
    <Surface interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">{value}</p>
          {caption && <p className="mt-1 text-sm text-slate-400">{caption}</p>}
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg', iconToneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Surface>
  );
}

export function PetAvatar({
  species,
  size = 'md',
  photoUrl,
  onPhotoSelect,
  onPhotoError,
}: {
  species: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  photoUrl?: string | null;
  onPhotoSelect?: (dataUrl: string) => void;
  onPhotoError?: (message: string) => void;
}) {
  const sizeClass = {
    sm: 'h-10 w-10 text-lg',
    md: 'h-14 w-14 text-2xl',
    lg: 'h-20 w-20 text-4xl',
    xl: 'h-28 w-28 text-5xl',
  }[size];

  const cameraButtonClassName =
    'absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-teal-600 text-white shadow-lg';

  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-amber-100 via-white to-teal-100 shadow-inner', sizeClass)}>
      {photoUrl ? (
        <img src={photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span>{petSpeciesEmoji[species] ?? '🐾'}</span>
      )}
      {size !== 'sm' && onPhotoSelect ? (
        <GalleryImagePicker onSelect={onPhotoSelect} onError={onPhotoError}>
          {(open) => (
            <button type="button" onClick={open} className={cameraButtonClassName} aria-label="Choose from gallery">
              <Camera className="h-3.5 w-3.5" />
            </button>
          )}
        </GalleryImagePicker>
      ) : size !== 'sm' ? (
        <span className={cameraButtonClassName}>
          <Camera className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </div>
  );
}

export function UploadAvatar({
  label = 'Choose from gallery',
  onChange,
  onError,
  disabled = false,
}: {
  label?: string;
  onChange?: (dataUrl: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}) {
  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-teal-700 opacity-60 shadow-sm">
        <Upload className="h-3.5 w-3.5" />
        {label}
      </span>
    );
  }

  return (
    <GalleryImagePicker onSelect={onChange} onError={onError}>
      {(open) => (
        <button
          type="button"
          onClick={open}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-teal-700 shadow-sm transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="h-3.5 w-3.5" />
          {label}
        </button>
      )}
    </GalleryImagePicker>
  );
}

export function PetCard({
  pet,
  onOpen,
  onBook,
}: {
  pet: {
    name: string;
    species: string;
    breed: string;
    age: number;
    weight: string;
    healthStatus: string;
    lastVisit: string;
    photoUrl?: string | null;
  };
  onOpen?: () => void;
  onBook?: () => void;
}) {
  return (
    <Surface interactive className="overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <PetAvatar species={pet.species} photoUrl={pet.photoUrl} />
        <StatusBadge status={pet.healthStatus} />
      </div>
      <div className="mt-5">
        <h3 className="text-xl font-black tracking-[-0.03em] text-white">{pet.name}</h3>
        <p className="mt-1 text-sm text-slate-400">{pet.breed} · {pet.age} years · {pet.weight}</p>
      </div>
      <div className="mt-5 rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Last visit</p>
        <p className="mt-1 text-sm font-bold text-slate-200">{pet.lastVisit}</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <PrimaryButton variant="secondary" onClick={onBook} icon={Calendar}>Book</PrimaryButton>
        <PrimaryButton variant="dark" onClick={onOpen} icon={ArrowRight}>Profile</PrimaryButton>
      </div>
    </Surface>
  );
}

export function AppointmentCard({
  appointment,
  compact = false,
  actions,
  onClick,
}: {
  appointment: {
    petName: string;
    petSpecies: string;
    ownerName?: string;
    doctorName: string;
    roomName?: string;
    date: string;
    time: string;
    service: string;
    status: string;
    notes?: string;
  };
  compact?: boolean;
  actions?: ReactNode;
  onClick?: () => void;
}) {
  const interactive = Boolean(onClick);
  return (
    <Surface
      interactive
      className={cn('p-4', compact && 'shadow-none', interactive && 'cursor-pointer')}
    >
      <div
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
        onClick={onClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
      >
        <PetAvatar species={appointment.petSpecies} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black tracking-[-0.02em] text-white">{appointment.petName}</h3>
            <StatusBadge status={appointment.status} />
          </div>
          <p className="mt-1 text-sm text-slate-300">{appointment.service}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-400">
            <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{appointment.date} · {appointment.time}</span>
            <span className="inline-flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" />{appointment.doctorName}</span>
            {appointment.ownerName && <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{appointment.ownerName}</span>}
            {appointment.roomName && <span className="inline-flex items-center gap-1"><DoorOpen className="h-3.5 w-3.5" />{appointment.roomName}</span>}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>{actions}</div> : null}
      </div>
    </Surface>
  );
}

export function DoctorCard({
  doctor,
  actions,
}: {
  doctor: {
    name: string;
    specialization: string;
    email: string;
    phone: string;
    status: string;
    todayAppointments: number;
    totalAppointments?: number;
    avatar: string;
    experience: string;
  };
  actions?: ReactNode;
}) {
  return (
    <Surface interactive className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-sm font-black text-white shadow-lg shadow-sky-500/20">
            {doctor.avatar}
          </div>
          <div className="min-w-0">
            <h3 className="break-words font-black tracking-[-0.02em] text-white">{doctor.name}</h3>
            <p className="break-words text-sm text-slate-400">{doctor.specialization}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={doctor.status} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Today</p>
          <p className="mt-1 text-xl font-black text-white">{doctor.todayAppointments}</p>
        </div>
        <div className="rounded-2xl border border-sky-400/25 bg-sky-500/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300">Visits</p>
          <p className="mt-1 text-xl font-black text-sky-100">{doctor.totalAppointments ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-teal-400/25 bg-teal-500/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-200">Experience</p>
          <p className="mt-1 text-base font-black leading-tight text-teal-100">{doctor.experience}</p>
        </div>
      </div>
      <div className="mt-4 break-all text-sm text-slate-400">
        <p>{doctor.email}</p>
        <p>{doctor.phone}</p>
      </div>
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </Surface>
  );
}

export function ClientCard({
  name,
  phone,
  petsCount,
  lastAppointment,
}: {
  name: string;
  phone: string;
  petsCount: number;
  lastAppointment: string;
}) {
  const initials = name.split(' ').map((part) => part[0]).join('');
  return (
    <Surface interactive className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-teal-400 text-sm font-black text-slate-900">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-white">{name}</h3>
          <p className="text-sm text-slate-400">{phone}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-500" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Pets</p>
          <p className="font-black text-white">{petsCount}</p>
        </div>
        <div className="rounded-2xl border border-teal-400/25 bg-teal-500/10 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">Last visit</p>
          <p className="font-black text-teal-100">{lastAppointment}</p>
        </div>
      </div>
    </Surface>
  );
}

export function MedicalTimeline({
  records,
}: {
  records: Array<{ id: string; date: string; petName: string; doctorName: string; reason: string; diagnosis: string; treatment?: string; nextVisit?: string }>;
}) {
  return (
    <div className="space-y-0">
      {records.map((record, index) => (
        <div key={record.id} className="grid grid-cols-[2.5rem_1fr] gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-400/30 bg-teal-500/15 text-teal-200">
              <FileText className="h-4 w-4" />
            </div>
            {index < records.length - 1 && <div className="my-2 w-px flex-1 bg-gradient-to-b from-teal-400/40 to-transparent" />}
          </div>
          <Surface className="mb-4 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{record.date} · {record.petName}</p>
                <h3 className="mt-1 font-black text-white">{record.reason}</h3>
                <p className="mt-1 text-sm text-slate-300">{record.diagnosis}</p>
              </div>
              <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs font-bold text-slate-300">{record.doctorName}</span>
            </div>
            {record.treatment && <p className="mt-3 text-sm text-slate-400">Treatment: {record.treatment}</p>}
            {record.nextVisit && <p className="mt-1 text-sm font-bold text-teal-200">Next visit: {record.nextVisit}</p>}
          </Surface>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <Surface className="p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-teal-400/30 bg-teal-500/15 text-teal-200">
        <Sparkles className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </Surface>
  );
}

export interface CalendarAppointment {
  id: string;
  time: string;
  petName: string;
  petSpecies: string;
  doctorId: string;
  doctorName: string;
  roomId?: string;
  roomName?: string;
  service: string;
  status: string;
}

export function CalendarGrid({
  appointments,
  onSelect,
  selectedId,
}: {
  appointments: CalendarAppointment[];
  onSelect?: (appointmentId: string) => void;
  selectedId?: string | null;
}) {
  const doctorMap = new Map<string, string>();
  for (const appointment of appointments) {
    if (!doctorMap.has(appointment.doctorId)) {
      doctorMap.set(appointment.doctorId, appointment.doctorName);
    }
  }
  const doctors = Array.from(doctorMap.entries()).map(([id, name]) => ({ id, name }));
  const hours = Array.from(new Set(appointments.map((appointment) => appointment.time))).sort((a, b) => {
    const parse = (label: string) => {
      const date = new Date(`1970-01-01 ${label}`);
      return Number.isNaN(date.getTime()) ? label : date.getTime();
    };
    const left = parse(a);
    const right = parse(b);
    if (typeof left === 'number' && typeof right === 'number') return left - right;
    return a.localeCompare(b);
  });

  if (!appointments.length || !doctors.length || !hours.length) {
    return (
      <EmptyState
        title="No appointments in this view"
        description="Adjust the date or filters to see scheduled visits."
      />
    );
  }

  const doctorColumnMin = 200;
  const totalMinWidth = 90 + doctors.length * doctorColumnMin;
  const gridTemplateColumns = `90px repeat(${doctors.length}, minmax(${doctorColumnMin}px, 1fr))`;

  return (
    <Surface className="overflow-hidden">
      <div className="hidden overflow-x-auto lg:block">
        <div style={{ minWidth: `${totalMinWidth}px` }}>
          <div className="grid border-b border-slate-700 bg-slate-900/70" style={{ gridTemplateColumns }}>
            <div className="p-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Time</div>
            {doctors.map((doctor) => (
              <div key={doctor.id} className="border-l border-slate-700 p-3">
                <p className="break-words text-sm font-black leading-tight text-white">{doctor.name}</p>
              </div>
            ))}
          </div>
          {hours.map((hour) => (
            <div key={hour} className="grid min-h-[96px] border-b border-slate-700 last:border-b-0" style={{ gridTemplateColumns }}>
              <div className="p-3 text-xs font-bold text-slate-400">{hour}</div>
              {doctors.map((doctor) => {
                const blocks = appointments.filter((a) => a.doctorId === doctor.id && a.time === hour);
                return (
                  <div key={doctor.id} className="relative space-y-2 border-l border-slate-700 p-2">
                    {blocks.map((appointment) => (
                      <AppointmentBlock
                        key={appointment.id}
                        appointment={appointment}
                        onClick={onSelect ? () => onSelect(appointment.id) : undefined}
                        selected={selectedId === appointment.id}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 p-4 lg:hidden">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            compact
            onClick={onSelect ? () => onSelect(appointment.id) : undefined}
          />
        ))}
      </div>
    </Surface>
  );
}

export function AppointmentBlock({
  appointment,
  tone = 'teal',
  onClick,
  selected,
}: {
  appointment: { petName: string; petSpecies: string; service: string; status: string; time: string; roomName?: string };
  tone?: Tone;
  onClick?: () => void;
  selected?: boolean;
}) {
  const interactive = Boolean(onClick);
  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        'rounded-2xl border p-2.5 shadow-sm transition',
        toneMap[tone],
        interactive && 'cursor-pointer hover:-translate-y-0.5',
        selected && 'ring-2 ring-teal-300/80',
      )}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.08em] opacity-80">{appointment.time}</p>
      <div className="mt-1 flex items-start gap-2">
        <span className="text-base leading-none">{petSpeciesEmoji[appointment.petSpecies] ?? '🐾'}</span>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-black leading-tight">{appointment.petName}</p>
          <p className="mt-0.5 break-words text-[11px] leading-snug opacity-80">{appointment.service}</p>
          {appointment.roomName ? (
            <p className="mt-1 inline-flex items-center gap-1 break-words text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">
              <DoorOpen className="h-3 w-3 flex-shrink-0" />
              <span className="break-words">{appointment.roomName}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Surface className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-black tracking-[-0.02em] text-white">{title}</h3>
        {action}
      </div>
      {children}
    </Surface>
  );
}

export function InsightItem({
  title,
  description,
  tone = 'teal',
  icon: Icon = AlertCircle,
}: {
  title: string;
  description: string;
  tone?: Tone;
  icon?: ElementType;
}) {
  return (
    <div className={cn('flex gap-3 rounded-2xl border p-4', toneMap[tone])}>
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-1 text-sm opacity-80">{description}</p>
      </div>
    </div>
  );
}

export function ClinicalNotePanel() {
  const fields = ['Symptoms', 'Diagnosis', 'Treatment plan', 'Prescription', 'Recommendations', 'Follow-up'];
  return (
    <Surface className="p-5">
      <SectionHeader title="Clinical note" description="Legacy placeholder for note editing. The live doctor note flow now writes through the dedicated medical-record UI." />
      <div className="grid gap-4">
        {fields.map((field, index) => (
          <label key={field} className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">{field}</span>
            <textarea
              disabled
              rows={index === 0 ? 3 : 2}
              placeholder={`Write ${field.toLowerCase()}...`}
              className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-400 outline-none"
            />
          </label>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-400">Keep using the dedicated doctor note screen for save and complete actions.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton variant="secondary" icon={FileText} disabled>Save draft</PrimaryButton>
        <PrimaryButton icon={CheckCircle2} disabled>Complete visit</PrimaryButton>
      </div>
    </Surface>
  );
}

export function PatientContextCard({
  petName,
  species,
  breed,
  owner,
}: {
  petName: string;
  species: string;
  breed: string;
  owner: string;
}) {
  return (
    <Surface className="p-5">
      <div className="flex items-center gap-4">
        <PetAvatar species={species} size="lg" />
        <div>
          <h3 className="text-2xl font-black tracking-[-0.04em] text-white">{petName}</h3>
          <p className="text-sm text-slate-400">{breed} · Owner: {owner}</p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-slate-700/60 bg-slate-800/60 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Context</p>
        <p className="mt-1 text-sm text-slate-300">This card now shows only identity data passed from the active screen. Clinical vitals and history must come from backend records.</p>
      </div>
    </Surface>
  );
}
