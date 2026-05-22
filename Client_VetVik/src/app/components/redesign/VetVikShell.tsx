import { useEffect, useRef, useState, type ElementType } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Command,
  FileText,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  PawPrint,
  Search,
  Settings,
  Shield,
  Stethoscope,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { roleLabel, type AppRole } from '../../auth/roles';
import { cn } from './VetVikUI';

interface NavItem {
  icon: ElementType;
  label: string;
  path: string;
}

const clientNav: NavItem[] = [
  { icon: Home, label: 'Home', path: '/client' },
  { icon: PawPrint, label: 'My Pets', path: '/client/pets' },
  { icon: CalendarDays, label: 'Appointments', path: '/client/appointments' },
  { icon: FileText, label: 'Medical History', path: '/client/medical-history' },
];

const doctorNav: NavItem[] = [
  { icon: Home, label: 'Today', path: '/doctor' },
  { icon: CalendarDays, label: 'Schedule', path: '/doctor/schedule' },
  { icon: ClipboardList, label: 'Appointments', path: '/doctor/appointments' },
  { icon: HeartPulse, label: 'Medical Notes', path: '/doctor/notes' },
];

const adminNav: NavItem[] = [
  { icon: Home, label: 'Ops Hub', path: '/admin' },
  { icon: CalendarDays, label: 'Clinic Calendar', path: '/admin/calendar' },
  { icon: ClipboardList, label: 'Appointments', path: '/admin/appointments' },
  { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
  { icon: Users, label: 'Clients', path: '/admin/clients' },
  { icon: BarChart3, label: 'Insights', path: '/admin/insights' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const staffNavItem: NavItem = { icon: Shield, label: 'Staff', path: '/admin/staff' };

function navForRole(role: AppRole): NavItem[] {
  switch (role) {
    case 'client':
      return clientNav;
    case 'doctor':
      return doctorNav;
    case 'admin':
      return adminNav;
    case 'superadmin':
      return [...adminNav.slice(0, 4), staffNavItem, ...adminNav.slice(4)];
  }
}

const roleVisuals: Record<AppRole, { color: string; section: string }> = {
  client: {
    color: 'from-amber-300 to-teal-300',
    section: 'My pets & visits',
  },
  doctor: {
    color: 'from-sky-400 to-teal-300',
    section: 'Today at the clinic',
  },
  admin: {
    color: 'from-slate-800 to-teal-500',
    section: 'Clinic operations',
  },
  superadmin: {
    color: 'from-violet-500 to-teal-500',
    section: 'Clinic administration',
  },
};

const notifications: Array<{ title: string; detail: string; tone: string }> = [];

export function VetVikShell() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!user) {
    return null;
  }

  const role = user.role;
  const navItems = navForRole(role);
  const visuals = roleVisuals[role];
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0) || user.firstName.charAt(1) || ''}`.toUpperCase();
  let profilePath = '/admin/profile';
  let routePrefix = '/admin';
  if (role === 'client') {
    profilePath = '/client/profile';
    routePrefix = '/client';
  } else if (role === 'doctor') {
    profilePath = '/doctor/profile';
    routePrefix = '/doctor';
  }

  const isActive = (path: string) => {
    if (path === routePrefix) {
      return location.pathname === routePrefix || location.pathname === `${routePrefix}/`;
    }
    return location.pathname.startsWith(path);
  };

  const navPanel = (
    <>
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="group flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-[1.35rem] bg-slate-950 text-white shadow-xl shadow-slate-950/20 transition group-hover:-rotate-3">
            <PawPrint className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-xl font-black tracking-[-0.06em] text-slate-950">VetVik</p>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">{roleLabel(role)}</p>
          </div>
        </button>
        <button className="rounded-2xl p-2 text-slate-400 hover:bg-white/70 lg:hidden" onClick={() => setMobileOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-5 rounded-[1.5rem] border border-white/70 bg-white/65 p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={cn('h-10 w-10 rounded-2xl bg-gradient-to-br shadow-inner', visuals.color)} />
          <div>
            <p className="text-sm font-black text-slate-950">{visuals.section}</p>
            <p className="text-xs text-slate-500">{displayName}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-bold transition-all',
                active
                  ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/15'
                  : 'text-slate-600 hover:bg-white/70 hover:text-slate-950',
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-teal-200' : 'text-slate-400 group-hover:text-teal-600')} />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-2 w-2 rounded-full bg-teal-300" />}
            </button>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f8f3] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-500/18 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-sky-500/12 blur-3xl" />
      </div>

      <aside className="fixed left-4 top-4 bottom-4 z-30 hidden w-72 flex-col rounded-[2rem] border border-white/80 bg-white/55 p-4 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:flex">
        {navPanel}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 p-3 backdrop-blur-sm lg:hidden">
          <aside className="flex h-full w-full max-w-sm flex-col rounded-[2rem] border border-white/80 bg-[#f7fbf7]/95 p-4 shadow-2xl">
            {navPanel}
          </aside>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-col lg:pl-80">
        <header className="sticky top-0 z-40 border-b border-slate-700/70 bg-slate-950/82 px-4 py-3 backdrop-blur-2xl lg:px-8">
          <div className="mx-auto flex max-w-[1500px] items-center gap-3">
            <button className="rounded-2xl border border-white/70 bg-white/70 p-2.5 shadow-sm lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden flex-1 items-center gap-3 rounded-2xl border border-white/80 bg-white/65 px-4 py-2.5 shadow-sm md:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search pets, appointments, doctors..." />
              <div className="hidden items-center gap-1 rounded-xl bg-slate-100 px-2 py-1 text-xs font-bold text-slate-400 xl:flex">
                <Command className="h-3 w-3" /> K
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setProfileOpen(false);
                  }}
                  className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/80 bg-white/70 shadow-sm transition hover:bg-white"
                >
                  <Bell className="h-4 w-4 text-slate-600" />
                  {notifications.length > 0 ? (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
                  ) : null}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-14 z-[90] w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.5rem] border border-slate-700 bg-slate-950 shadow-2xl">
                    <div className="border-b border-slate-100 p-4">
                      <p className="font-black text-slate-950">Notifications</p>
                      <p className="text-xs text-slate-500">Live backend notifications will appear here when connected.</p>
                    </div>
                    {notifications.length ? notifications.map((item) => (
                      <button key={item.title} className="flex w-full gap-3 border-b border-slate-50 p-4 text-left last:border-b-0 hover:bg-teal-50/50">
                        <span className={cn('mt-1 h-2.5 w-2.5 rounded-full', item.tone)} />
                        <span>
                          <span className="block text-sm font-black text-slate-900">{item.title}</span>
                          <span className="text-xs text-slate-500">{item.detail}</span>
                        </span>
                      </button>
                    )) : (
                      <div className="p-4 text-sm text-slate-500">
                        No runtime notifications are shown until the backend notifications feed is available.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/70 py-1.5 pl-1.5 pr-3 shadow-sm transition hover:bg-white"
                >
                  <div className={cn('grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-xs font-black text-white', visuals.color)}>
                    {initials}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-black leading-none text-slate-950">{displayName}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-400">{roleLabel(role)}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-14 z-[90] w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.5rem] border border-slate-700 bg-slate-950 py-2 shadow-2xl">
                    <div className="px-4 pb-3 pt-2">
                      <p className="text-sm font-black text-slate-950">{displayName}</p>
                      <p className="text-xs text-slate-500">{roleLabel(role)}</p>
                    </div>
                    {[
                      { icon: UserCircle, label: 'My Profile', path: profilePath },
                      { icon: Settings, label: 'Account Settings', path: profilePath },
                      { icon: Bell, label: 'Notifications', path: profilePath },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            navigate(item.path);
                            setProfileOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="mt-1 flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-5 lg:px-8 lg:py-8">
          <Outlet />
        </main>

        <nav className="sticky bottom-0 z-20 grid grid-cols-4 gap-1 border-t border-white/80 bg-white/85 p-2 backdrop-blur-2xl lg:hidden">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn('flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-black', active ? 'bg-slate-950 text-white' : 'text-slate-500')}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function ShellGuardIcon({ role }: Readonly<{ role: AppRole }>) {
  if (role === 'admin' || role === 'superadmin') return <Shield className="h-4 w-4" />;
  if (role === 'doctor') return <Stethoscope className="h-4 w-4" />;
  return <PawPrint className="h-4 w-4" />;
}
