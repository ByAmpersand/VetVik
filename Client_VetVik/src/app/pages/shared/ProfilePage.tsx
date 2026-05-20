import { useState } from 'react';
import { useLocation } from 'react-router';
import {
  Camera, User, Mail, Phone, Lock, Bell, Shield,
  Save, CheckCircle, Eye, EyeOff,
} from 'lucide-react';

type Role = 'owner' | 'doctor' | 'admin';

const profileData = {
  owner: {
    name: 'Anna Smith',
    email: 'anna.smith@example.com',
    phone: '+1 (555) 100-2000',
    role: 'Pet Owner',
    initials: 'AS',
    color: 'bg-teal-500',
    joinDate: 'March 2024',
    bio: 'Pet owner with 3 beloved animals. Passionate about preventive healthcare for pets.',
    address: '42 Maple Street, Portland, OR 97201',
  },
  doctor: {
    name: 'Dr. Olivia Carter',
    email: 'o.carter@vetvik.com',
    phone: '+1 (555) 001-1234',
    role: 'Veterinarian',
    initials: 'OC',
    color: 'bg-blue-500',
    joinDate: 'January 2022',
    bio: 'General veterinary practitioner with 12 years of experience specializing in small animals.',
    address: 'VetVik Clinic, 100 Medical Drive, Portland, OR 97201',
  },
  admin: {
    name: 'James Peterson',
    email: 'j.peterson@vetvik.com',
    phone: '+1 (555) 500-0001',
    role: 'Clinic Administrator',
    initials: 'JP',
    color: 'bg-purple-500',
    joinDate: 'June 2021',
    bio: 'Clinic operations manager responsible for scheduling, doctor coordination, and system management.',
    address: 'VetVik Clinic, 100 Medical Drive, Portland, OR 97201',
  },
};

function detectRole(pathname: string): Role {
  if (pathname.startsWith('/doctor')) return 'doctor';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'owner';
}

export function ProfilePage() {
  const location = useLocation();
  const role = detectRole(location.pathname);
  const data = profileData[role];

  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [saved, setSaved] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    name: data.name,
    email: data.email,
    phone: data.phone,
    bio: data.bio,
    address: data.address,
  });
  const [notifPrefs, setNotifPrefs] = useState({
    emailAppointments: true,
    emailReminders: true,
    emailUpdates: false,
    smsAppointments: true,
    smsReminders: false,
    pushAll: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    { id: 'profile', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your account settings and preferences</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            Changes saved
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left: Avatar + nav */}
        <div className="lg:col-span-1 space-y-4">
          {/* Avatar card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center">
            <div className="relative inline-block mb-3">
              <div className={`w-20 h-20 ${data.color} rounded-2xl flex items-center justify-center text-white mx-auto`} style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {data.initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors">
                <Camera className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
            <p className="text-slate-900" style={{ fontWeight: 700 }}>{data.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{data.role}</p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">Member since</p>
              <p className="text-xs text-slate-600 mt-0.5" style={{ fontWeight: 500 }}>{data.joinDate}</p>
            </div>

            {/* Upload area */}
            <div className="mt-3 border-2 border-dashed border-slate-200 rounded-xl p-3 hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer">
              <Camera className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Upload photo</p>
              <p className="text-xs text-slate-300 mt-0.5">PNG, JPG up to 2MB</p>
            </div>
          </div>

          {/* Section nav */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    activeSection === s.id
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  style={{ fontWeight: activeSection === s.id ? 600 : 500 }}
                >
                  <Icon className={`w-4 h-4 ${activeSection === s.id ? 'text-teal-600' : 'text-slate-400'}`} />
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Role badge */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <p className="text-xs text-slate-500" style={{ fontWeight: 600 }}>ACCOUNT TYPE</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${data.color} bg-opacity-10`}>
              <div className={`w-2 h-2 ${data.color} rounded-full`} />
              <span className="text-xs text-slate-700" style={{ fontWeight: 600 }}>{data.role}</span>
            </div>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Personal Info */}
            {activeSection === 'profile' && (
              <div>
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-slate-900" style={{ fontWeight: 700 }}>Personal Information</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Update your personal details and contact information</p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Full name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Role</label>
                      <div className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 bg-slate-50 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        {data.role}
                        <span className="ml-auto text-xs text-slate-400">Read only</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Phone number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Address</label>
                    <input
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Bio</label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      <Save className="w-4 h-4" />
                      Save changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div>
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-slate-900" style={{ fontWeight: 700 }}>Security Settings</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage your password and account security</p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-green-800" style={{ fontWeight: 600 }}>Account secured</p>
                      <p className="text-xs text-green-600">Your account is protected. Last login: May 19, 2025 at 8:45 AM</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-slate-900 mb-4" style={{ fontWeight: 600 }}>Change Password</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Current password', show: showOld, toggle: () => setShowOld(!showOld) },
                        { label: 'New password', show: showNew, toggle: () => setShowNew(!showNew) },
                        { label: 'Confirm new password', show: showNew, toggle: () => setShowNew(!showNew) },
                      ].map((field, i) => (
                        <div key={i}>
                          <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>{field.label}</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={field.show ? 'text' : 'password'}
                              placeholder="••••••••"
                              className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <button
                              type="button"
                              onClick={field.toggle}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-slate-900 mb-3" style={{ fontWeight: 600 }}>Active Sessions</h3>
                    {[
                      { device: 'MacBook Pro', browser: 'Chrome 124', location: 'Portland, OR', time: 'Current session', current: true },
                      { device: 'iPhone 15', browser: 'Safari', location: 'Portland, OR', time: '2 days ago', current: false },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{session.device} · {session.browser}</p>
                          <p className="text-xs text-slate-400">{session.location} · {session.time}</p>
                        </div>
                        {session.current ? (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg" style={{ fontWeight: 500 }}>Active</span>
                        ) : (
                          <button className="text-xs text-red-600 hover:text-red-700" style={{ fontWeight: 500 }}>Revoke</button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      <Save className="w-4 h-4" />
                      Update password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div>
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-slate-900" style={{ fontWeight: 700 }}>Notification Preferences</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Choose how and when you receive notifications</p>
                </div>
                <div className="p-6 space-y-6">
                  {[
                    {
                      title: 'Email Notifications',
                      desc: 'Receive updates via email',
                      icon: Mail,
                      prefs: [
                        { key: 'emailAppointments', label: 'Appointment confirmations', desc: 'When appointments are booked or changed' },
                        { key: 'emailReminders', label: 'Appointment reminders', desc: '24 hours before each appointment' },
                        { key: 'emailUpdates', label: 'Product updates', desc: 'New features and announcements' },
                      ],
                    },
                    {
                      title: 'SMS Notifications',
                      desc: 'Receive text message alerts',
                      icon: Phone,
                      prefs: [
                        { key: 'smsAppointments', label: 'Appointment alerts', desc: 'Critical appointment notifications' },
                        { key: 'smsReminders', label: 'Day-of reminders', desc: 'Morning reminder on appointment day' },
                      ],
                    },
                  ].map((section) => {
                    const Icon = section.icon;
                    return (
                      <div key={section.title}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{section.title}</p>
                            <p className="text-xs text-slate-400">{section.desc}</p>
                          </div>
                        </div>
                        <div className="space-y-2 pl-6">
                          {section.prefs.map((pref) => (
                            <div key={pref.key} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                              <div>
                                <p className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{pref.label}</p>
                                <p className="text-xs text-slate-400">{pref.desc}</p>
                              </div>
                              <button
                                onClick={() => setNotifPrefs({ ...notifPrefs, [pref.key]: !notifPrefs[pref.key as keyof typeof notifPrefs] })}
                                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                                  notifPrefs[pref.key as keyof typeof notifPrefs] ? 'bg-teal-500' : 'bg-slate-200'
                                }`}
                              >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                                  notifPrefs[pref.key as keyof typeof notifPrefs] ? 'translate-x-5' : 'translate-x-0.5'
                                }`} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      <Save className="w-4 h-4" />
                      Save preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
