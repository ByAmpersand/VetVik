import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';
import { PrimaryButton, Surface, cn } from '../../components/redesign/VetVikUI';

const roles = [
  { label: 'Owners', path: '/owner', icon: PawPrint, text: 'Pets, appointments, reminders, medical history.' },
  { label: 'Doctors', path: '/doctor', icon: Stethoscope, text: 'Schedule, patient context, notes, follow-ups.' },
  { label: 'Admins', path: '/admin', icon: ShieldCheck, text: 'Clinic flow, calendars, staff, insights.' },
];

export function PremiumLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f8f3] text-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-teal-200/45 blur-3xl" />
        <div className="absolute right-10 top-1/3 h-96 w-96 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <button onClick={() => navigate('/')} className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-[1.35rem] bg-slate-950 text-white shadow-xl shadow-slate-950/20">
            <PawPrint className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-xl font-black tracking-[-0.06em]">VetVik</p>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Veterinary SaaS</p>
          </div>
        </button>
        <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 md:flex">
          <a href="#platform" className="hover:text-teal-700">Platform</a>
          <a href="#workflow" className="hover:text-teal-700">Workflow</a>
          <a href="#roles" className="hover:text-teal-700">Roles</a>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/login')} className="hidden rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white/70 sm:block">
            Log in
          </button>
          <PrimaryButton onClick={() => navigate('/register')} icon={ArrowRight}>Start demo</PrimaryButton>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-10 lg:grid-cols-[1fr_0.95fr] lg:pt-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Premium clinic operations without enterprise noise
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.08em] text-slate-950 md:text-7xl">
              Veterinary care, designed like a calm control room.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              VetVik connects owners, doctors, and admins in one warm, high-clarity platform for scheduling, medical records, clinic flow, and actionable insights.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => navigate('/register')} icon={CalendarCheck}>Book a demo visit</PrimaryButton>
              <PrimaryButton onClick={() => navigate('/admin')} variant="secondary" icon={ShieldCheck}>Explore admin workspace</PrimaryButton>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {['Appointment-first workflow', 'Role-aware product surfaces', 'Warm pet-care identity'].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/65 px-3 py-2 text-sm font-bold text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <ProductPreview />
        </section>

        <section id="platform" className="mx-auto grid max-w-7xl gap-4 px-5 py-12 md:grid-cols-3">
          {[
            { icon: CalendarCheck, title: 'Appointments as the product core', text: 'A clean scheduling model with rooms, doctors, services, statuses, and conflict-ready UI.' },
            { icon: HeartPulse, title: 'Clinical clarity', text: 'Notes, timelines, patient context, and medical history are readable at a glance.' },
            { icon: Users, title: 'Operations without clutter', text: 'Admin pages stay focused; heavy analytics live in dedicated Insights.' },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <Surface key={feature.title} interactive className="p-6">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-[-0.03em]">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </Surface>
            );
          })}
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-5 py-12">
          <Surface className="overflow-hidden p-6 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">Clinic workflow</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] md:text-5xl">From booking to medical record, every step feels connected.</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Owner books visit', 'Admin places doctor + room', 'Doctor sees timeline', 'Record closes the appointment'].map((step, index) => (
                  <div key={step} className="rounded-[1.35rem] border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs font-black text-teal-600">0{index + 1}</p>
                    <p className="mt-2 font-black text-slate-950">{step}</p>
                    <p className="mt-1 text-sm text-slate-500">Operational, realistic, and easy to defend in a diploma review.</p>
                  </div>
                ))}
              </div>
            </div>
          </Surface>
        </section>

        <section id="roles" className="mx-auto max-w-7xl px-5 py-12 pb-24">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">Role-based experience</p>
              <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950">Three workspaces, one product language.</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Surface key={role.label} interactive className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <button onClick={() => navigate(role.path)} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                      Open demo
                    </button>
                  </div>
                  <h3 className="mt-5 text-2xl font-black tracking-[-0.04em]">{role.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{role.text}</p>
                </Surface>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function ProductPreview() {
  const items = [
    { time: '09:00', pet: 'Luna', service: 'General checkup', color: 'bg-teal-50 text-teal-800 border-teal-100' },
    { time: '10:30', pet: 'Max', service: 'Vaccination', color: 'bg-sky-50 text-sky-800 border-sky-100' },
    { time: '13:00', pet: 'Bella', service: 'Dermatology', color: 'bg-amber-50 text-amber-900 border-amber-100' },
  ];
  return (
    <Surface className="relative p-4 lg:p-5">
      <div className="rounded-[1.7rem] border border-slate-100 bg-slate-950 p-4 text-white">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-200">Today at VetVik</p>
            <p className="mt-1 text-2xl font-black tracking-[-0.05em]">Clinic command view</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-black">Live demo</div>
        </div>
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.pet} className={cn('rounded-2xl border p-4', item.color)}>
              <div className="flex items-center justify-between">
                <p className="font-black">{item.time} · {item.pet}</p>
                <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-black">Scheduled</span>
              </div>
              <p className="mt-1 text-sm opacity-80">{item.service} · Room 1 · Dr. Carter</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ['24', 'Today visits'],
          ['86%', 'Clinic load'],
          ['3', 'Rooms active'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl bg-white/70 p-3 text-center">
            <p className="text-2xl font-black tracking-[-0.04em]">{value}</p>
            <p className="text-xs font-bold text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </Surface>
  );
}

export function PremiumLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('/owner');

  return (
    <AuthFrame
      title="Welcome back to your care workspace"
      subtitle="Sign in with a demo role or continue with your account."
      sideTitle="Care, operations, and clinical work in one calm product."
    >
      <form onSubmit={(event) => { event.preventDefault(); navigate(role); }} className="space-y-5">
        <RoleSelector role={role} onChange={setRole} />
        <Field label="Email address" placeholder="anna@vetvik.local" type="email" />
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 pr-11 text-sm outline-none transition focus:border-teal-200 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" className="accent-teal-600" /> Remember me</label>
          <button type="button" className="font-bold text-teal-700">Forgot password?</button>
        </div>
        <PrimaryButton type="submit" icon={ArrowRight}>Enter workspace</PrimaryButton>
      </form>
    </AuthFrame>
  );
}

export function PremiumRegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('/owner');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthFrame
      title="Create a VetVik workspace account"
      subtitle="Choose a role, create credentials, and preview the product instantly."
      sideTitle="A warmer way to run a veterinary clinic."
    >
      <form onSubmit={(event) => { event.preventDefault(); navigate(role); }} className="space-y-5">
        <RoleSelector role={role} onChange={setRole} />
        <Field label="Full name" placeholder="Anna Smith" />
        <Field label="Email address" placeholder="anna@vetvik.local" type="email" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 pr-11 text-sm outline-none transition focus:border-teal-200 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Field label="Confirm" placeholder="••••••••" type="password" />
        </div>
        <div className="rounded-2xl bg-teal-50 p-3 text-sm font-bold text-teal-800">
          Strong demo password: at least 8 characters, 1 uppercase letter, 1 number.
        </div>
        <PrimaryButton type="submit" icon={ArrowRight}>Create account</PrimaryButton>
      </form>
    </AuthFrame>
  );
}

function AuthFrame({ title, subtitle, sideTitle, children }: { title: string; subtitle: string; sideTitle: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f5f8f3] p-4 text-slate-950">
      <div className="grid min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] border border-white/80 bg-white/45 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:block">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-teal-400/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
          <button onClick={() => navigate('/')} className="relative z-10 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[1.35rem] bg-white text-slate-950">
              <PawPrint className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-[-0.05em]">VetVik</span>
          </button>
          <div className="relative z-10 mt-28">
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-teal-100">Premium veterinary SaaS</p>
            <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.07em]">{sideTitle}</h2>
            <div className="mt-8 grid gap-3">
              {['Role-aware navigation', 'Single consistent profile menu', 'Operational pages without clutter'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm font-bold text-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-teal-200" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>
        <main className="flex items-center justify-center p-5 lg:p-10">
          <div className="w-full max-w-xl">
            <button onClick={() => navigate('/')} className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-[1.25rem] bg-slate-950 text-white">
                <PawPrint className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-[-0.05em]">VetVik</span>
            </button>
            <Surface className="p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">Secure access</p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] md:text-4xl">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
              <div className="mt-7">{children}</div>
            </Surface>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-200 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
      />
    </label>
  );
}

function RoleSelector({ role, onChange }: { role: string; onChange: (role: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {roles.map((item) => {
        const Icon = item.icon;
        const active = role === item.path;
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => onChange(item.path)}
            className={cn(
              'rounded-2xl border p-3 text-left transition',
              active ? 'border-teal-200 bg-teal-50 text-teal-900 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-white',
            )}
          >
            <Icon className="mb-2 h-4 w-4" />
            <p className="text-sm font-black">{item.label}</p>
          </button>
        );
      })}
    </div>
  );
}
