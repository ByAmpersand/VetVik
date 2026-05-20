import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router';
import {
  LayoutDashboard, PawPrint, Calendar, FileText, Settings,
  Bell, Search, Stethoscope, ClipboardList, Users,
  Clock, User, LogOut, ChevronRight, Menu, X,
  ChevronDown, UserCircle, Shield,
} from 'lucide-react';

type Role = 'owner' | 'doctor' | 'admin';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const ownerNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/owner' },
  { icon: PawPrint, label: 'My Pets', path: '/owner/pets' },
  { icon: Calendar, label: 'Appointments', path: '/owner/appointments' },
  { icon: FileText, label: 'Medical History', path: '/owner/medical-history' },
  { icon: Settings, label: 'Settings', path: '/owner/profile' },
];

const doctorNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor' },
  { icon: Clock, label: 'Schedule', path: '/doctor/schedule' },
  { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
  { icon: ClipboardList, label: 'Medical Notes', path: '/doctor/notes' },
  { icon: User, label: 'Profile', path: '/doctor/profile' },
];

const adminNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Calendar, label: 'Clinic Calendar', path: '/admin/calendar' },
  { icon: ClipboardList, label: 'Appointments', path: '/admin/appointments' },
  { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
  { icon: Users, label: 'Clients', path: '/admin/clients' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const roleConfig = {
  owner: {
    nav: ownerNav,
    userName: 'Anna Smith',
    userRole: 'Pet Owner',
    initials: 'AS',
    color: 'bg-teal-500',
    profilePath: '/owner/profile',
  },
  doctor: {
    nav: doctorNav,
    userName: 'Dr. Olivia Carter',
    userRole: 'Veterinarian',
    initials: 'OC',
    color: 'bg-blue-500',
    profilePath: '/doctor/profile',
  },
  admin: {
    nav: adminNav,
    userName: 'James Peterson',
    userRole: 'Clinic Admin',
    initials: 'JP',
    color: 'bg-purple-500',
    profilePath: '/admin/settings',
  },
};

const notifications = [
  { title: 'Upcoming appointment', desc: 'Luna — General checkup tomorrow at 10:00 AM', time: '2h ago', dot: 'bg-teal-500', read: false },
  { title: 'Vaccination overdue', desc: "Max's Rabies vaccine is overdue", time: '1d ago', dot: 'bg-amber-500', read: false },
  { title: 'Visit completed', desc: "Bella's vaccination visit is complete", time: '2d ago', dot: 'bg-green-500', read: true },
  { title: 'New appointment booked', desc: 'Rocky — Surgery follow-up on May 22', time: '3d ago', dot: 'bg-blue-500', read: true },
];

interface DashboardLayoutProps {
  role: Role;
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const config = roleConfig[role];
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path: string) => {
    if (path === `/${role}`) return location.pathname === `/${role}` || location.pathname === `/${role}/`;
    return location.pathname.startsWith(path);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-60' : 'w-14'} flex-shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ease-in-out relative z-10`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3.5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <PawPrint className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              VetVik
            </span>
          )}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role indicator */}
        {sidebarOpen && (
          <div className="mx-3 mt-3 mb-1 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="text-slate-700 text-xs mt-0.5" style={{ fontWeight: 600 }}>{config.userRole}</p>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {config.nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-teal-600' : ''}`} />
                {sidebarOpen && (
                  <span className="text-sm flex-1" style={{ fontWeight: active ? 600 : 500 }}>
                    {item.label}
                  </span>
                )}
                {sidebarOpen && active && (
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full ml-auto" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Demo role switcher */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400 px-2 mb-2" style={{ fontWeight: 500 }}>Demo role</p>
            <div className="flex gap-1">
              {(['owner', 'doctor', 'admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => navigate(`/${r}`)}
                  className={`flex-1 text-xs py-1.5 rounded-lg transition-all capitalize ${
                    role === r
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom user + logout */}
        <div className="border-t border-slate-100 p-2">
          <button
            onClick={() => navigate(config.profilePath)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors ${
              isActive(config.profilePath) ? 'bg-slate-50' : ''
            }`}
          >
            <div className={`w-7 h-7 ${config.color} rounded-full flex items-center justify-center text-white text-xs flex-shrink-0`} style={{ fontWeight: 600 }}>
              {config.initials}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs text-slate-900 truncate" style={{ fontWeight: 600 }}>{config.userName}</p>
                <p className="text-xs text-slate-400 truncate">{config.userRole}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/login'); }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </button>

          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors mt-1"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1 min-w-0">
            {/* Breadcrumb / page title derived from location */}
            <p className="text-xs text-slate-400">
              {config.userRole}
              <span className="mx-1.5">›</span>
              <span className="text-slate-600" style={{ fontWeight: 500 }}>
                {config.nav.find((n) => isActive(n.path))?.label || 'Dashboard'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-44 focus:w-56 transition-all"
              />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors relative"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center text-white" style={{ fontSize: '9px', fontWeight: 700 }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <p className="text-sm text-slate-900" style={{ fontWeight: 700 }}>Notifications</p>
                    <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                      {unreadCount} new
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <div key={i} className={`px-4 py-3 hover:bg-slate-50 flex items-start gap-3 cursor-pointer ${!n.read ? 'bg-teal-50/30' : ''}`}>
                        <div className={`w-2 h-2 ${n.dot} rounded-full mt-1.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-900" style={{ fontWeight: n.read ? 500 : 600 }}>{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                        </div>
                        {!n.read && <div className="w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0 mt-1" />}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-100">
                    <button className="text-xs text-teal-600 hover:text-teal-700" style={{ fontWeight: 500 }}>
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
              >
                <div className={`w-7 h-7 ${config.color} rounded-full flex items-center justify-center text-white text-xs flex-shrink-0`} style={{ fontWeight: 600 }}>
                  {config.initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs text-slate-900 leading-none" style={{ fontWeight: 600 }}>{config.userName.split(' ')[0]}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{config.userRole}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${config.color} rounded-full flex items-center justify-center text-white text-xs`} style={{ fontWeight: 700 }}>
                        {config.initials}
                      </div>
                      <div>
                        <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{config.userName}</p>
                        <p className="text-xs text-slate-400">{config.userRole}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    {[
                      { icon: UserCircle, label: 'My Profile', path: config.profilePath },
                      { icon: Settings, label: 'Settings', path: config.profilePath },
                      { icon: Bell, label: 'Notifications', path: config.profilePath },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={() => { navigate(item.path); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Scheduled: 'bg-blue-100 text-blue-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
    'In progress': 'bg-amber-100 text-amber-700',
    Available: 'bg-emerald-100 text-emerald-700',
    Busy: 'bg-amber-100 text-amber-700',
    'Off duty': 'bg-slate-100 text-slate-500',
    Healthy: 'bg-emerald-100 text-emerald-700',
    'Needs Attention': 'bg-amber-100 text-amber-700',
    'Under Treatment': 'bg-blue-100 text-blue-700',
    'Up to date': 'bg-emerald-100 text-emerald-700',
    'Due soon': 'bg-amber-100 text-amber-700',
    Overdue: 'bg-red-100 text-red-700',
  };
  const cls = map[status] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${cls}`} style={{ fontWeight: 500 }}>
      {status}
    </span>
  );
}
