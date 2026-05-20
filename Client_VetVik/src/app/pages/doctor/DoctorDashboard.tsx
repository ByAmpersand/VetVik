import { useNavigate } from 'react-router';
import {
  Calendar, Clock, FileText, Users, ChevronRight, ArrowRight,
  CheckCircle, AlertCircle, Stethoscope, TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatusBadge } from '../../components/DashboardLayout';
import { appointments, weeklyWorkload, petSpeciesEmoji } from '../../data/mockData';

const todayAppointments = appointments.filter((a) => a.date === 'May 19, 2025' && a.doctorId === 'd1');
const pendingNotes = appointments.filter((a) => a.status === 'Completed' && a.doctorId === 'd1' && !a.diagnosis);

export function DoctorDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: "Today's Appointments", value: todayAppointments.length, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Completed Today', value: todayAppointments.filter((a) => a.status === 'Completed').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Notes', value: 2, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Patients Today', value: todayAppointments.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const nextAppointment = todayAppointments.find((a) => a.status === 'Scheduled');

  return (
    <div className="flex gap-6 p-6 min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-blue-500 rounded-full -translate-y-1/3 translate-x-1/3 opacity-40" />
          <div className="relative z-10">
            <p className="text-blue-200 text-sm mb-1">Good morning, Doctor 👨‍⚕️</p>
            <h2 className="mb-1" style={{ fontSize: '1.4rem', fontWeight: 700 }}>Dr. Olivia Carter</h2>
            <p className="text-blue-100 text-sm mb-4">You have {todayAppointments.length} appointments scheduled for today.</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/doctor/schedule')}
                className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-xl text-sm hover:bg-blue-50 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Calendar className="w-4 h-4" />
                View schedule
              </button>
              <button
                onClick={() => navigate('/doctor/appointments')}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-400 transition-colors"
                style={{ fontWeight: 600 }}
              >
                All appointments
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className={`w-9 h-9 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5" style={{ fontWeight: 500 }}>{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Next appointment focus card */}
        {nextAppointment && (
          <div className="bg-white border-2 border-teal-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                <p className="text-xs text-teal-600" style={{ fontWeight: 700 }}>NEXT APPOINTMENT</p>
              </div>
              <StatusBadge status={nextAppointment.status} />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl">
                {petSpeciesEmoji[nextAppointment.petSpecies]}
              </div>
              <div className="flex-1">
                <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{nextAppointment.petName}</h3>
                <p className="text-slate-500 text-sm">Owner: {nextAppointment.ownerName}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{nextAppointment.time}</span>
                  <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" />{nextAppointment.service}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/doctor/notes')}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Open
              </button>
            </div>
          </div>
        )}

        {/* Today's schedule */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900" style={{ fontWeight: 700 }}>Today's Schedule</h3>
            <button
              onClick={() => navigate('/doctor/schedule')}
              className="text-xs text-blue-600 flex items-center gap-1 hover:text-blue-700"
              style={{ fontWeight: 500 }}
            >
              Full schedule <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No appointments scheduled for today.</div>
            ) : (
              todayAppointments.map((apt) => (
                <div key={apt.id} className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all hover:border-blue-200 ${
                  apt.status === 'In progress' ? 'border-amber-200 bg-amber-50' : 'border-slate-100'
                }`}>
                  <div className="text-center w-14">
                    <p className="text-slate-900 text-xs" style={{ fontWeight: 700 }}>{apt.time.split(' ')[0]}</p>
                    <p className="text-slate-400 text-xs">{apt.time.split(' ')[1]}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-base flex-shrink-0">
                    {petSpeciesEmoji[apt.petSpecies]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{apt.petName}</p>
                    <p className="text-xs text-slate-400">{apt.ownerName} · {apt.service}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                  <button
                    onClick={() => navigate('/doctor/notes')}
                    className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs hover:bg-blue-50"
                    style={{ fontWeight: 500 }}
                  >
                    Open
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly workload chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-slate-900 mb-4" style={{ fontWeight: 700 }}>Weekly Workload</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyWorkload} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: '#f1f5f9', radius: 6 }}
              />
              <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 flex-shrink-0 space-y-4 hidden xl:block">
        {/* Pending medical notes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-amber-600" style={{ fontWeight: 700 }}>PENDING NOTES ({2})</p>
          </div>
          <div className="space-y-2">
            {[
              { pet: 'Luna', owner: 'Anna Smith', service: 'General checkup', time: 'May 19, 9:00 AM' },
              { pet: 'Rocky', owner: 'Tom Baker', service: 'Surgery follow-up', time: 'May 19, 11:30 AM' },
            ].map((note, i) => (
              <button
                key={i}
                onClick={() => navigate('/doctor/notes')}
                className="w-full flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl text-left hover:border-amber-200 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-800" style={{ fontWeight: 600 }}>{note.pet} · {note.service}</p>
                  <p className="text-xs text-slate-500">{note.owner}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{note.time}</p>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/doctor/notes')}
            className="w-full mt-3 py-2 border border-amber-200 text-amber-600 rounded-xl text-xs hover:bg-amber-50 transition-colors"
            style={{ fontWeight: 500 }}
          >
            View all pending
          </button>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>QUICK ACTIONS</p>
          <div className="space-y-2">
            {[
              { label: 'View schedule', icon: Calendar, path: '/doctor/schedule', color: 'text-blue-600 bg-blue-50' },
              { label: 'All appointments', icon: Stethoscope, path: '/doctor/appointments', color: 'text-teal-600 bg-teal-50' },
              { label: 'Medical notes', icon: FileText, path: '/doctor/notes', color: 'text-purple-600 bg-purple-50' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>THIS WEEK</p>
          <div className="space-y-3">
            {[
              { label: 'Appointments', value: '42', trend: '+5', },
              { label: 'Completed', value: '38', trend: '+3' },
              { label: 'Avg. duration', value: '28 min', trend: '-2' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{item.value}</span>
                  <span className="text-xs text-green-600 flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />{item.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
