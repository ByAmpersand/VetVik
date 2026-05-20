import { useState } from 'react';
import {
  Building2, Clock, Bell, Palette, Sliders, Globe,
  Save, CheckCircle, Upload, Camera,
} from 'lucide-react';

const sections = [
  { id: 'clinic', label: 'Clinic Info', icon: Building2 },
  { id: 'hours', label: 'Working Hours', icon: Clock },
  { id: 'appointments', label: 'Appointments', icon: Sliders },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'branding', label: 'Branding', icon: Palette },
] as const;

type Section = typeof sections[number]['id'];

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOUR_OPTIONS = Array.from({ length: 13 }, (_, i) => {
  const h = i + 7;
  return `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;
});

export function ClinicSettings() {
  const [active, setActive] = useState<Section>('clinic');
  const [saved, setSaved] = useState(false);

  const [clinicInfo, setClinicInfo] = useState({
    name: 'VetVik Animal Clinic',
    email: 'info@vetvik.com',
    phone: '+1 (555) 000-VETS',
    address: '100 Medical Drive, Portland, OR 97201',
    website: 'vetvik.com',
    license: 'OR-VET-2021-4821',
    timezone: 'America/Los_Angeles',
  });

  const [workingHours, setWorkingHours] = useState(
    WEEK_DAYS.map((day, i) => ({
      day,
      enabled: i < 5,
      open: '9:00 AM',
      close: '6:00 PM',
    }))
  );

  const [aptSettings, setAptSettings] = useState({
    defaultDuration: 30,
    bufferTime: 10,
    maxPerDay: 20,
    allowOnlineBooking: true,
    advanceBookingDays: 30,
    cancellationHours: 24,
    autoConfirm: false,
  });

  const [notifSettings, setNotifSettings] = useState({
    reminderEmail: true,
    reminder24h: true,
    reminder2h: false,
    confirmationSms: true,
    cancellationAlert: true,
    newBookingAlert: true,
    dailySummary: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Clinic Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure your clinic's information, hours, and preferences</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            Settings saved
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-2 sticky top-6">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active === s.id
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  style={{ fontWeight: active === s.id ? 600 : 500 }}
                >
                  <Icon className={`w-4 h-4 ${active === s.id ? 'text-teal-600' : 'text-slate-400'}`} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Clinic Info */}
            {active === 'clinic' && (
              <>
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-slate-900" style={{ fontWeight: 700 }}>Clinic Information</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Basic information about your veterinary clinic</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Clinic name</label>
                      <input
                        value={clinicInfo.name}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Contact email</label>
                      <input
                        type="email"
                        value={clinicInfo.email}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Phone number</label>
                      <input
                        type="tel"
                        value={clinicInfo.phone}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Address</label>
                      <input
                        value={clinicInfo.address}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Website</label>
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
                        <span className="px-3 py-2.5 bg-slate-50 text-sm text-slate-400 border-r border-slate-200">https://</span>
                        <input
                          value={clinicInfo.website}
                          onChange={(e) => setClinicInfo({ ...clinicInfo, website: e.target.value })}
                          className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>License number</label>
                      <input
                        value={clinicInfo.license}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, license: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Timezone</label>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <select
                          value={clinicInfo.timezone}
                          onChange={(e) => setClinicInfo({ ...clinicInfo, timezone: e.target.value })}
                          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                          <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                          <option value="America/Denver">Mountain Time (UTC-7)</option>
                          <option value="America/Chicago">Central Time (UTC-6)</option>
                          <option value="America/New_York">Eastern Time (UTC-5)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Working Hours */}
            {active === 'hours' && (
              <>
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-slate-900" style={{ fontWeight: 700 }}>Working Hours</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Set your clinic's operating hours for each day</p>
                </div>
                <div className="p-6 space-y-2">
                  {workingHours.map((row, i) => (
                    <div key={row.day} className={`flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 ${!row.enabled ? 'opacity-50' : ''}`}>
                      <div className="w-28 flex-shrink-0">
                        <p className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{row.day}</p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = [...workingHours];
                          updated[i].enabled = !updated[i].enabled;
                          setWorkingHours(updated);
                        }}
                        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${row.enabled ? 'bg-teal-500' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${row.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                      {row.enabled ? (
                        <div className="flex items-center gap-2 flex-1">
                          <select
                            value={row.open}
                            onChange={(e) => {
                              const updated = [...workingHours];
                              updated[i].open = e.target.value;
                              setWorkingHours(updated);
                            }}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            {HOUR_OPTIONS.map((h) => <option key={h}>{h}</option>)}
                          </select>
                          <span className="text-slate-400 text-sm">–</span>
                          <select
                            value={row.close}
                            onChange={(e) => {
                              const updated = [...workingHours];
                              updated[i].close = e.target.value;
                              setWorkingHours(updated);
                            }}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            {HOUR_OPTIONS.map((h) => <option key={h}>{h}</option>)}
                          </select>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">Closed</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Appointment Settings */}
            {active === 'appointments' && (
              <>
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-slate-900" style={{ fontWeight: 700 }}>Appointment Settings</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Configure appointment duration, limits, and booking rules</p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Default appointment duration</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={aptSettings.defaultDuration}
                          onChange={(e) => setAptSettings({ ...aptSettings, defaultDuration: Number(e.target.value) })}
                          className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          {[15, 20, 30, 45, 60, 90].map((v) => <option key={v} value={v}>{v} minutes</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Buffer time between appointments</label>
                      <select
                        value={aptSettings.bufferTime}
                        onChange={(e) => setAptSettings({ ...aptSettings, bufferTime: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {[0, 5, 10, 15, 20].map((v) => <option key={v} value={v}>{v} minutes</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Max appointments per day (per doctor)</label>
                      <input
                        type="number"
                        value={aptSettings.maxPerDay}
                        onChange={(e) => setAptSettings({ ...aptSettings, maxPerDay: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        min={1}
                        max={50}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Advance booking limit (days)</label>
                      <input
                        type="number"
                        value={aptSettings.advanceBookingDays}
                        onChange={(e) => setAptSettings({ ...aptSettings, advanceBookingDays: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        min={1}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Cancellation notice required (hours)</label>
                      <input
                        type="number"
                        value={aptSettings.cancellationHours}
                        onChange={(e) => setAptSettings({ ...aptSettings, cancellationHours: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-sm text-slate-700" style={{ fontWeight: 600 }}>Booking options</p>
                    {[
                      { key: 'allowOnlineBooking', label: 'Allow online booking', desc: 'Pet owners can book appointments through the portal' },
                      { key: 'autoConfirm', label: 'Auto-confirm bookings', desc: 'New appointments are automatically confirmed without review' },
                    ].map((opt) => (
                      <div key={opt.key} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{opt.label}</p>
                          <p className="text-xs text-slate-400">{opt.desc}</p>
                        </div>
                        <button
                          onClick={() => setAptSettings({ ...aptSettings, [opt.key]: !aptSettings[opt.key as keyof typeof aptSettings] })}
                          className={`relative w-10 h-5 rounded-full transition-colors ${aptSettings[opt.key as keyof typeof aptSettings] ? 'bg-teal-500' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${aptSettings[opt.key as keyof typeof aptSettings] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notifications */}
            {active === 'notifications' && (
              <>
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-slate-900" style={{ fontWeight: 700 }}>Notification Settings</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Control automated alerts and reminders for clients and staff</p>
                </div>
                <div className="p-6 space-y-2">
                  {Object.entries({
                    reminderEmail: { label: 'Send appointment reminder emails', desc: 'Email clients before their appointment' },
                    reminder24h: { label: '24-hour reminder', desc: 'Send reminder 24 hours before appointment' },
                    reminder2h: { label: '2-hour reminder', desc: 'Send reminder 2 hours before appointment' },
                    confirmationSms: { label: 'SMS confirmation', desc: 'Text clients when appointment is confirmed' },
                    cancellationAlert: { label: 'Cancellation alerts', desc: 'Notify staff when an appointment is cancelled' },
                    newBookingAlert: { label: 'New booking alerts', desc: 'Notify staff of new appointment bookings' },
                    dailySummary: { label: 'Daily summary email', desc: 'Send daily schedule summary to clinic staff' },
                  }).map(([key, config]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{config.label}</p>
                        <p className="text-xs text-slate-400">{config.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifSettings({ ...notifSettings, [key]: !notifSettings[key as keyof typeof notifSettings] })}
                        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-4 ${notifSettings[key as keyof typeof notifSettings] ? 'bg-teal-500' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notifSettings[key as keyof typeof notifSettings] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Branding */}
            {active === 'branding' && (
              <>
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-slate-900" style={{ fontWeight: 700 }}>Branding & Appearance</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Customize your clinic's visual identity</p>
                </div>
                <div className="p-6 space-y-5">
                  {/* Logo upload */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-2" style={{ fontWeight: 600 }}>Clinic Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-teal-500 rounded-xl flex items-center justify-center text-white text-xl" style={{ fontWeight: 700 }}>
                        🐾
                      </div>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex-1 text-center hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer">
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <p className="text-xs text-slate-500" style={{ fontWeight: 500 }}>Upload new logo</p>
                        <p className="text-xs text-slate-400">PNG, SVG, 512×512px recommended</p>
                      </div>
                    </div>
                  </div>

                  {/* Accent color */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-2" style={{ fontWeight: 600 }}>Primary Color</label>
                    <div className="flex gap-2">
                      {['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-rose-500', 'bg-orange-500'].map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 ${color} rounded-lg border-2 ${color === 'bg-teal-500' ? 'border-slate-800 scale-110' : 'border-transparent'} transition-all hover:scale-110`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Patient portal welcome message */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 600 }}>Portal Welcome Message</label>
                    <textarea
                      defaultValue="Welcome to VetVik Animal Clinic. We're committed to providing the best care for your beloved pets."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Save footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Save className="w-4 h-4" />
                Save settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
