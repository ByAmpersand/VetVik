import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Plus, X, Clock, User, Filter } from 'lucide-react';
import { StatusBadge } from '../../components/DashboardLayout';
import { appointments, doctors, petSpeciesEmoji } from '../../data/mockData';

type CalendarView = 'day' | 'week';

const HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 9AM–5PM
const HOUR_HEIGHT = 64; // px per hour

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEK_DATES = [19, 20, 21, 22, 23];

const DOCTOR_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'd1': { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-900', dot: 'bg-teal-500' },
  'd2': { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-900', dot: 'bg-blue-500' },
  'd3': { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-900', dot: 'bg-purple-500' },
};

const STATUS_OVERLAY: Record<string, string> = {
  Scheduled: '',
  'In progress': 'border-l-4 border-l-amber-500',
  Completed: 'opacity-70',
  Cancelled: 'opacity-50 line-through',
};

function parseTimeToDecimal(timeStr: string): number {
  const [time, period] = timeStr.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h + (m || 0) / 60;
}

export function ClinicCalendar() {
  const navigate = useNavigate();
  const [view, setView] = useState<CalendarView>('day');
  const [doctorFilter, setDoctorFilter] = useState<string[]>(doctors.map((d) => d.id));
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApt, setSelectedApt] = useState<typeof appointments[0] | null>(null);
  const [currentDay, setCurrentDay] = useState(0); // index into WEEK_DAYS

  const toggleDoctor = (id: string) => {
    setDoctorFilter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const visibleDoctors = doctors.filter((d) => doctorFilter.includes(d.id));

  const todayApts = appointments.filter((a) => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchDoctor = doctorFilter.includes(a.doctorId);
    return matchStatus && matchDoctor;
  });

  // Group appointments by doctor for the day view
  const aptsByDoctor = (doctorId: string) =>
    todayApts.filter((a) => a.doctorId === doctorId && a.date === 'May 19, 2025');

  // For week view: show appointments per day per doctor
  const aptsByDayDoctor = (dayIndex: number, doctorId: string) => {
    // Only day 0 (Monday May 19) has real data; simulate others
    if (dayIndex === 0) return aptsByDoctor(doctorId);
    return [];
  };

  const totalToday = todayApts.filter((a) => a.date === 'May 19, 2025').length;

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Clinic Calendar</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {visibleDoctors.length} of {doctors.length} doctors · {totalToday} appointments today
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Create appointment
        </button>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
        {/* Day navigation */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <button
            onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <span className="text-sm text-slate-700 px-2" style={{ fontWeight: 600 }}>
            {view === 'week' ? 'May 19–23, 2025' : `${WEEK_DAYS[currentDay]}, May ${WEEK_DATES[currentDay]}, 2025`}
          </span>
          <button
            onClick={() => setCurrentDay(Math.min(WEEK_DAYS.length - 1, currentDay + 1))}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Doctor filter pills */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {doctors.map((d) => {
            const colors = DOCTOR_COLORS[d.id];
            const active = doctorFilter.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => toggleDoctor(d.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                  active
                    ? `${colors.bg} ${colors.text} border ${colors.border}`
                    : 'text-slate-400 border border-slate-200 hover:border-slate-300'
                }`}
                style={{ fontWeight: 500 }}
              >
                {active && <div className={`w-1.5 h-1.5 ${colors.dot} rounded-full`} />}
                {d.name.replace('Dr. ', '')}
              </button>
            );
          })}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1.5">
          {['All', 'Scheduled', 'In progress', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${
                statusFilter === s ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
              style={{ fontWeight: 500 }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 ml-auto">
          {(['day', 'week'] as CalendarView[]).map((v) => (
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

      {/* Calendar + panel */}
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Calendar */}
        <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          {/* Doctor column headers */}
          {view === 'day' && (
            <div className="flex border-b border-slate-200 flex-shrink-0">
              {/* Time gutter header */}
              <div className="w-16 flex-shrink-0 border-r border-slate-100" />
              {visibleDoctors.map((doc) => {
                const colors = DOCTOR_COLORS[doc.id];
                const count = aptsByDoctor(doc.id).length;
                return (
                  <div
                    key={doc.id}
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 border-r border-slate-100 last:border-r-0"
                  >
                    <div className={`w-7 h-7 ${colors.bg} rounded-full flex items-center justify-center text-xs ${colors.text} flex-shrink-0`} style={{ fontWeight: 700 }}>
                      {doc.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-800 truncate" style={{ fontWeight: 700 }}>{doc.name}</p>
                      <p className="text-xs text-slate-400">{count} apt{count !== 1 ? 's' : ''} today</p>
                    </div>
                    <div className={`ml-auto w-2 h-2 ${
                      doc.status === 'Available' ? 'bg-green-400' :
                      doc.status === 'Busy' ? 'bg-amber-400' : 'bg-slate-300'
                    } rounded-full flex-shrink-0`} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Week view: day column headers */}
          {view === 'week' && (
            <div className="flex border-b border-slate-200 flex-shrink-0">
              <div className="w-16 flex-shrink-0 border-r border-slate-100" />
              {WEEK_DAYS.map((day, idx) => (
                <div
                  key={day}
                  className={`flex-1 text-center py-2.5 border-r border-slate-100 last:border-r-0 ${
                    idx === currentDay ? 'bg-teal-50' : ''
                  }`}
                >
                  <p className="text-xs text-slate-400" style={{ fontWeight: 500 }}>{day}</p>
                  <button
                    onClick={() => { setCurrentDay(idx); setView('day'); }}
                    className={`text-sm mt-0.5 w-7 h-7 rounded-full mx-auto flex items-center justify-center transition-colors hover:bg-teal-100 ${
                      idx === currentDay ? 'bg-teal-500 text-white' : 'text-slate-700'
                    }`}
                    style={{ fontWeight: 700 }}
                  >
                    {WEEK_DATES[idx]}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Scrollable time grid */}
          <div className="flex-1 overflow-y-auto">
            {/* Day view: multi-doctor columns */}
            {view === 'day' && (
              <div className="flex">
                {/* Time axis */}
                <div className="w-16 flex-shrink-0 border-r border-slate-100">
                  {HOURS.map((h) => (
                    <div key={h} className="flex items-start px-2 pt-1.5" style={{ height: HOUR_HEIGHT }}>
                      <span className="text-xs text-slate-400 leading-none">
                        {h > 12 ? `${h - 12}:00` : `${h}:00`}
                        <span className="text-slate-300 ml-0.5">{h >= 12 ? 'PM' : 'AM'}</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Doctor columns */}
                {visibleDoctors.map((doc, docIdx) => {
                  const colors = DOCTOR_COLORS[doc.id];
                  const docApts = aptsByDoctor(doc.id);
                  return (
                    <div
                      key={doc.id}
                      className="flex-1 relative border-r border-slate-100 last:border-r-0"
                      style={{ minWidth: 0 }}
                    >
                      {/* Hour gridlines */}
                      {HOURS.map((h) => (
                        <div
                          key={h}
                          className="border-b border-slate-100"
                          style={{ height: HOUR_HEIGHT }}
                        >
                          {/* Half-hour line */}
                          <div className="border-b border-slate-50" style={{ height: HOUR_HEIGHT / 2 }} />
                        </div>
                      ))}

                      {/* Current time indicator — only show on first column */}
                      {docIdx === 0 && (
                        <div
                          className="absolute left-0 right-0 z-20 pointer-events-none"
                          style={{ top: `${((10.5 - 9) / 9) * (HOURS.length * HOUR_HEIGHT)}px` }}
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-400 rounded-full -ml-1 flex-shrink-0" />
                            <div className="flex-1 h-px bg-red-400" />
                          </div>
                        </div>
                      )}

                      {/* Appointment blocks */}
                      {docApts.map((apt) => {
                        const startH = parseTimeToDecimal(apt.time);
                        const duration = 0.75; // 45 minutes default
                        const topPct = ((startH - 9) / 9) * 100;
                        const heightPct = (duration / 9) * 100;
                        if (topPct < 0 || topPct > 95) return null;
                        return (
                          <button
                            key={apt.id}
                            onClick={() => setSelectedApt(apt)}
                            className={`absolute left-1 right-1 rounded-xl border-l-4 ${colors.border} ${colors.bg} p-1.5 text-left hover:brightness-95 transition-all z-10 overflow-hidden ${
                              apt.status === 'Cancelled' ? 'opacity-50' : ''
                            } ${apt.status === 'Completed' ? 'opacity-70' : ''}`}
                            style={{
                              top: `${(topPct / 100) * (HOURS.length * HOUR_HEIGHT)}px`,
                              height: `${Math.max((heightPct / 100) * (HOURS.length * HOUR_HEIGHT), 40)}px`,
                            }}
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-base leading-none">{petSpeciesEmoji[apt.petSpecies]}</span>
                              <span className={`text-xs ${colors.text} truncate`} style={{ fontWeight: 700 }}>
                                {apt.petName}
                              </span>
                            </div>
                            <p className={`text-xs ${colors.text} opacity-80 truncate`}>{apt.service}</p>
                            <p className={`text-xs ${colors.text} opacity-60`}>{apt.time}</p>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Week view: day columns with stacked appointments */}
            {view === 'week' && (
              <div className="flex">
                {/* Time axis */}
                <div className="w-16 flex-shrink-0 border-r border-slate-100">
                  {HOURS.map((h) => (
                    <div key={h} className="flex items-start px-2 pt-1.5" style={{ height: HOUR_HEIGHT }}>
                      <span className="text-xs text-slate-400 leading-none">
                        {h > 12 ? `${h - 12}` : `${h}`}
                        <span className="text-slate-300 ml-0.5">{h >= 12 ? 'PM' : 'AM'}</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {WEEK_DAYS.map((day, dayIdx) => (
                  <div
                    key={day}
                    className={`flex-1 relative border-r border-slate-100 last:border-r-0 ${
                      dayIdx === currentDay ? 'bg-teal-50/20' : ''
                    }`}
                  >
                    {HOURS.map((h) => (
                      <div key={h} className="border-b border-slate-100" style={{ height: HOUR_HEIGHT }}>
                        <div className="border-b border-slate-50" style={{ height: HOUR_HEIGHT / 2 }} />
                      </div>
                    ))}

                    {/* Appointments for this day */}
                    {dayIdx === 0 && todayApts.filter((a) => a.date === 'May 19, 2025').map((apt) => {
                      const colors = DOCTOR_COLORS[apt.doctorId] || DOCTOR_COLORS['d1'];
                      const startH = parseTimeToDecimal(apt.time);
                      const topPct = ((startH - 9) / 9) * 100;
                      if (topPct < 0 || topPct > 95) return null;
                      return (
                        <button
                          key={apt.id}
                          onClick={() => setSelectedApt(apt)}
                          className={`absolute left-0.5 right-0.5 rounded-lg border-l-2 ${colors.border} ${colors.bg} px-1.5 py-1 text-left hover:brightness-95 z-10 overflow-hidden`}
                          style={{
                            top: `${(topPct / 100) * (HOURS.length * HOUR_HEIGHT)}px`,
                            height: '44px',
                          }}
                        >
                          <p className={`text-xs ${colors.text} truncate`} style={{ fontWeight: 600 }}>{apt.petName}</p>
                          <p className={`text-xs ${colors.text} opacity-70 truncate`}>{apt.time}</p>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right detail panel */}
        <div className="w-68 flex-shrink-0" style={{ width: '272px' }}>
          {selectedApt ? (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-sm text-slate-900" style={{ fontWeight: 700 }}>Appointment</p>
                <button onClick={() => setSelectedApt(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {petSpeciesEmoji[selectedApt.petSpecies]}
                  </div>
                  <div>
                    <p className="text-slate-900" style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedApt.petName}</p>
                    <p className="text-xs text-slate-500">{selectedApt.petSpecies}</p>
                  </div>
                </div>

                <StatusBadge status={selectedApt.status} />

                <div className="space-y-2.5">
                  {[
                    { label: 'Time', value: `${selectedApt.date} · ${selectedApt.time}` },
                    { label: 'Duration', value: '45 minutes' },
                    { label: 'Service', value: selectedApt.service },
                    { label: 'Doctor', value: selectedApt.doctorName },
                    { label: 'Owner', value: selectedApt.ownerName },
                    { label: 'Phone', value: selectedApt.ownerPhone },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400" style={{ fontWeight: 500 }}>{label}</p>
                      <p className="text-xs text-slate-800 mt-0.5" style={{ fontWeight: 500 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {selectedApt.notes && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>NOTES</p>
                    <p className="text-xs text-slate-700">{selectedApt.notes}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <button className="w-full py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors" style={{ fontWeight: 600 }}>
                    Edit appointment
                  </button>
                  <button className="w-full py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors" style={{ fontWeight: 500 }}>
                    Mark completed
                  </button>
                  <button className="w-full py-2 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition-colors" style={{ fontWeight: 500 }}>
                    Cancel appointment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>TODAY'S STATUS</p>
                {doctors.map((doc) => {
                  const colors = DOCTOR_COLORS[doc.id];
                  const count = aptsByDoctor(doc.id).length;
                  return (
                    <div key={doc.id} className="flex items-center gap-2.5 mb-3">
                      <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center text-xs ${colors.text} flex-shrink-0`} style={{ fontWeight: 700 }}>
                        {doc.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 truncate" style={{ fontWeight: 600 }}>{doc.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="flex-1 bg-slate-100 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${colors.dot.replace('bg-', 'bg-')}`}
                              style={{ width: `${(count / 8) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{count}</span>
                        </div>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>COLOR LEGEND</p>
                {doctors.map((doc) => {
                  const colors = DOCTOR_COLORS[doc.id];
                  return (
                    <div key={doc.id} className="flex items-center gap-2 mb-1.5">
                      <div className={`w-3 h-3 rounded ${colors.bg} border ${colors.border}`} />
                      <span className="text-xs text-slate-600">{doc.name}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400 mb-2" style={{ fontWeight: 600 }}>SUMMARY</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Total', value: totalToday },
                    { label: 'Scheduled', value: todayApts.filter((a) => a.status === 'Scheduled' && a.date === 'May 19, 2025').length },
                    { label: 'In progress', value: todayApts.filter((a) => a.status === 'In progress' && a.date === 'May 19, 2025').length },
                    { label: 'Completed', value: todayApts.filter((a) => a.status === 'Completed' && a.date === 'May 19, 2025').length },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between">
                      <span className="text-xs text-slate-500">{s.label}</span>
                      <span className="text-xs text-slate-800" style={{ fontWeight: 700 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400 pt-1">Click an appointment block to see details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
