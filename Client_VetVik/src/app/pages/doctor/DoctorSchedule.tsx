import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Clock, Stethoscope, User, X } from 'lucide-react';
import { StatusBadge } from '../../components/DashboardLayout';
import { appointments, petSpeciesEmoji } from '../../data/mockData';

const doctorAppointments = appointments.filter((a) => a.doctorId === 'd1');

const HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM

const appointmentSlots = [
  { id: 'a7', time: '9:00', duration: 1, apt: doctorAppointments[6] },
  { id: 'a8', time: '10:30', duration: 1, apt: doctorAppointments[7] },
  { id: 'a1', time: '10:00', duration: 1, apt: doctorAppointments[0] },
  { id: 'a9', time: '13:00', duration: 1, apt: doctorAppointments[8] },
  { id: 'a5', time: '11:30', duration: 1, apt: doctorAppointments[4] },
];

const statusColorMap: Record<string, string> = {
  Scheduled: 'bg-blue-100 border-blue-300 text-blue-800',
  'In progress': 'bg-amber-100 border-amber-300 text-amber-800',
  Completed: 'bg-green-100 border-green-300 text-green-800',
  Cancelled: 'bg-red-100 border-red-300 text-red-800',
};

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const weekDates = [19, 20, 21, 22, 23];

export function DoctorSchedule() {
  const navigate = useNavigate();
  const [view, setView] = useState<'day' | 'week'>('day');
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedApt, setSelectedApt] = useState<typeof appointments[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const dayAppointments = doctorAppointments.filter((a) => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchStatus;
  });

  const getHour = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h + (m || 0) / 60;
  };

  return (
    <div className="p-6 flex gap-5 h-full min-h-0">
      {/* Calendar area */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Schedule</h1>
            <p className="text-slate-500 text-sm mt-0.5">May 2025 · {dayAppointments.length} appointments</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Status filter */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {['All', 'Scheduled', 'In progress', 'Completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    statusFilter === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              {(['day', 'week'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-lg text-xs transition-all capitalize ${
                    view === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Week navigation */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <button className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <span className="text-sm text-slate-700" style={{ fontWeight: 600 }}>May 19–23, 2025</span>
            <button className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {view === 'week' ? (
            /* Week view */
            <div className="flex divide-x divide-slate-100">
              {weekDays.map((day, idx) => (
                <div key={day} className={`flex-1 min-w-0 ${selectedDay === idx ? 'bg-blue-50' : ''}`}>
                  <button
                    onClick={() => { setSelectedDay(idx); setView('day'); }}
                    className={`w-full text-center py-3 border-b border-slate-100 transition-colors hover:bg-blue-50 ${selectedDay === idx ? 'bg-blue-50' : ''}`}
                  >
                    <p className="text-xs text-slate-400">{day}</p>
                    <p className={`text-sm mt-0.5 ${selectedDay === idx ? 'text-blue-600' : 'text-slate-800'}`} style={{ fontWeight: 700 }}>{weekDates[idx]}</p>
                  </button>
                  <div className="p-2 space-y-1 min-h-24">
                    {idx === 0 && dayAppointments.slice(0, 3).map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => setSelectedApt(apt)}
                        className={`w-full text-left p-1.5 rounded-lg text-xs border ${statusColorMap[apt.status] || 'bg-slate-100 border-slate-300'} truncate`}
                        style={{ fontWeight: 500 }}
                      >
                        {apt.time} · {apt.petName}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Day view timeline */
            <div className="relative">
              <div className="flex">
                {/* Time axis */}
                <div className="w-16 flex-shrink-0">
                  {HOURS.map((h) => (
                    <div key={h} className="h-16 flex items-start pt-1 px-3">
                      <span className="text-xs text-slate-400">{h > 12 ? `${h - 12}PM` : `${h}AM`}</span>
                    </div>
                  ))}
                </div>

                {/* Timeline content */}
                <div className="flex-1 relative border-l border-slate-100">
                  {HOURS.map((h) => (
                    <div key={h} className="h-16 border-b border-slate-100" />
                  ))}

                  {/* Current time indicator */}
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-blue-500 z-10"
                    style={{ top: `${((10.5 - 9) / 9) * 100}%` }}
                  >
                    <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-blue-500 rounded-full" />
                  </div>

                  {/* Appointment blocks */}
                  {dayAppointments.map((apt) => {
                    const [h, m] = apt.time.replace(' AM', '').replace(' PM', '').split(':').map(Number);
                    const hour = apt.time.includes('PM') && h !== 12 ? h + 12 : h;
                    const top = ((hour + (m || 0) / 60 - 9) / 9) * 100;
                    if (top < 0 || top > 90) return null;
                    return (
                      <button
                        key={apt.id}
                        onClick={() => setSelectedApt(apt)}
                        className={`absolute left-2 right-2 rounded-xl border p-2 text-left ${statusColorMap[apt.status] || 'bg-slate-100 border-slate-300'} hover:opacity-90 transition-opacity z-20`}
                        style={{ top: `${top}%`, height: '3.5rem' }}
                      >
                        <p className="text-xs truncate" style={{ fontWeight: 700 }}>{apt.petName}</p>
                        <p className="text-xs truncate opacity-80">{apt.time} · {apt.service}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right detail panel */}
      <div className="w-72 flex-shrink-0">
        {selectedApt ? (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <p className="text-sm text-slate-900" style={{ fontWeight: 700 }}>Appointment Details</p>
              <button onClick={() => setSelectedApt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Pet */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
                  {petSpeciesEmoji[selectedApt.petSpecies]}
                </div>
                <div>
                  <p className="text-slate-900" style={{ fontWeight: 700 }}>{selectedApt.petName}</p>
                  <p className="text-xs text-slate-500">{selectedApt.petSpecies}</p>
                </div>
              </div>

              <StatusBadge status={selectedApt.status} />

              <div className="space-y-2 text-sm">
                {[
                  { icon: Clock, label: 'Time', value: `${selectedApt.date} · ${selectedApt.time}` },
                  { icon: Stethoscope, label: 'Service', value: selectedApt.service },
                  { icon: User, label: 'Owner', value: selectedApt.ownerName },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-slate-700" style={{ fontWeight: 500, fontSize: '0.8rem' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedApt.notes && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>NOTES</p>
                  <p className="text-xs text-slate-700">{selectedApt.notes}</p>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => navigate('/doctor/notes')}
                  className="w-full py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Open appointment
                </button>
                <button className="w-full py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50" style={{ fontWeight: 500 }}>
                  View pet profile
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs text-slate-400 mb-4" style={{ fontWeight: 600 }}>TODAY'S SUMMARY</p>
            <div className="space-y-3">
              {[
                { label: 'Total', value: dayAppointments.length, color: 'text-slate-900' },
                { label: 'Scheduled', value: dayAppointments.filter((a) => a.status === 'Scheduled').length, color: 'text-blue-600' },
                { label: 'In progress', value: dayAppointments.filter((a) => a.status === 'In progress').length, color: 'text-amber-600' },
                { label: 'Completed', value: dayAppointments.filter((a) => a.status === 'Completed').length, color: 'text-green-600' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <span className={`text-sm ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 mt-4 pt-4">
              <p className="text-xs text-slate-500 mb-3">Click an appointment block to view details.</p>
              <div className="space-y-1.5">
                {dayAppointments.slice(0, 4).map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => setSelectedApt(apt)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-left"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="text-xs text-slate-700 truncate" style={{ fontWeight: 500 }}>
                      {apt.time} · {apt.petName} · {apt.service}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
