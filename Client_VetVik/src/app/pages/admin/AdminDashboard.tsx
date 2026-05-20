import { useNavigate } from 'react-router';
import {
  Calendar, Stethoscope, PawPrint, CheckCircle, ArrowRight,
  ChevronRight, Users, Plus, BarChart3, Clock, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { StatusBadge } from '../../components/DashboardLayout';
import { appointments, doctors, pets, monthlyTrend, petSpeciesEmoji } from '../../data/mockData';

const todayAppointments = appointments.filter((a) => a.date === 'May 19, 2025');

const recentActivity = [
  { type: 'appointment', text: 'Luna — General checkup started', time: '9:02 AM', color: 'bg-amber-400' },
  { type: 'completed', text: 'Rocky — Surgery follow-up completed', time: '8:45 AM', color: 'bg-green-400' },
  { type: 'new', text: 'New appointment booked for Max', time: '8:30 AM', color: 'bg-blue-400' },
  { type: 'doctor', text: 'Dr. Emily Brown marked as Available', time: '8:15 AM', color: 'bg-teal-400' },
  { type: 'new', text: 'New pet registered: Rocky (German Shepherd)', time: '7:50 AM', color: 'bg-purple-400' },
];

export function AdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Appointments Today', value: todayAppointments.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', change: '+3', up: true },
    { label: 'Active Doctors', value: doctors.filter((d) => d.status !== 'Off duty').length, icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50', change: '+0', up: true },
    { label: 'Registered Pets', value: pets.length, icon: PawPrint, color: 'text-amber-600', bg: 'bg-amber-50', change: '+2', up: true },
    { label: 'Completed Today', value: todayAppointments.filter((a) => a.status === 'Completed').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', change: '+5', up: true },
  ];

  return (
    <div className="flex gap-5 p-6 min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-slate-700 rounded-full -translate-y-1/3 translate-x-1/3 opacity-30" />
          <div className="relative z-10">
            <p className="text-slate-400 text-sm mb-1">Good morning, Admin 📊</p>
            <h2 className="mb-1" style={{ fontSize: '1.4rem', fontWeight: 700 }}>James Peterson</h2>
            <p className="text-slate-300 text-sm mb-4">
              Today there are {todayAppointments.length} appointments scheduled and {doctors.filter((d) => d.status === 'Available').length} doctors available.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/admin/appointments')}
                className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-teal-600 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-4 h-4" />
                Create appointment
              </button>
              <button
                onClick={() => navigate('/admin/doctors')}
                className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-xl text-sm hover:bg-white/20 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Stethoscope className="w-4 h-4" />
                Manage doctors
              </button>
              <button
                onClick={() => navigate('/admin/calendar')}
                className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-xl text-sm hover:bg-white/20 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Calendar className="w-4 h-4" />
                Clinic calendar
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
                <div className="flex items-end justify-between">
                  <p className="text-slate-900" style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
                  <span className="text-xs text-green-600 flex items-center gap-0.5 mb-1">
                    <TrendingUp className="w-3 h-3" />{s.change}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-1" style={{ fontWeight: 500 }}>{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Monthly trend */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900" style={{ fontWeight: 700 }}>Monthly Appointments</h3>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg" style={{ fontWeight: 600 }}>+24% vs last month</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorApt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="appointments" stroke="#14B8A6" fill="url(#colorApt)" strokeWidth={2} name="Scheduled" />
                <Area type="monotone" dataKey="completed" stroke="#3B82F6" fill="url(#colorComp)" strokeWidth={2} name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Doctor workload */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900" style={{ fontWeight: 700 }}>Doctor Workload Today</h3>
            </div>
            <div className="space-y-4">
              {doctors.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-700 flex-shrink-0" style={{ fontWeight: 700 }}>
                    {doc.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-700 truncate" style={{ fontWeight: 600 }}>{doc.name}</p>
                      <span className="text-xs text-slate-500">{doc.todayAppointments}/10</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${doc.todayAppointments >= 8 ? 'bg-amber-500' : 'bg-teal-500'}`}
                        style={{ width: `${(doc.todayAppointments / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's appointments table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-slate-900" style={{ fontWeight: 700 }}>Today's Appointments</h3>
            <button
              onClick={() => navigate('/admin/appointments')}
              className="text-xs text-teal-600 flex items-center gap-1 hover:text-teal-700"
              style={{ fontWeight: 500 }}
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {['Time', 'Pet', 'Owner', 'Doctor', 'Service', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500" style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{apt.time}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{petSpeciesEmoji[apt.petSpecies]}</span>
                        <span className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{apt.petName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{apt.ownerName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{apt.doctorName.replace('Dr. ', 'Dr. ')}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{apt.service}</td>
                    <td className="px-4 py-3"><StatusBadge status={apt.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="px-2.5 py-1 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50" style={{ fontWeight: 500 }}>View</button>
                        <button className="px-2.5 py-1 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50" style={{ fontWeight: 500 }}>Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 flex-shrink-0 space-y-4 hidden xl:block">
        {/* Doctor availability */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400" style={{ fontWeight: 600 }}>DOCTOR STATUS</p>
            <button onClick={() => navigate('/admin/doctors')} className="text-xs text-teal-600" style={{ fontWeight: 500 }}>Manage</button>
          </div>
          <div className="space-y-3">
            {doctors.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-700" style={{ fontWeight: 700 }}>
                  {doc.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 truncate" style={{ fontWeight: 600 }}>{doc.name}</p>
                  <p className="text-xs text-slate-400 truncate">{doc.specialization}</p>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>QUICK ACTIONS</p>
          <div className="space-y-2">
            {[
              { label: 'Create appointment', icon: Calendar, path: '/admin/appointments', color: 'text-blue-600 bg-blue-50' },
              { label: 'Add doctor', icon: Stethoscope, path: '/admin/doctors', color: 'text-teal-600 bg-teal-50' },
              { label: 'Manage schedule', icon: Clock, path: '/admin/calendar', color: 'text-purple-600 bg-purple-50' },
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

        {/* Recent activity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>RECENT ACTIVITY</p>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-2 h-2 ${item.color} rounded-full mt-1.5 flex-shrink-0`} />
                <div>
                  <p className="text-xs text-slate-700">{item.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinic stats */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>CLINIC OVERVIEW</p>
          <div className="space-y-3">
            {[
              { label: 'Total appointments', value: appointments.length },
              { label: 'Total pets', value: pets.length },
              { label: 'Total doctors', value: doctors.length },
              { label: 'Completion rate', value: `${Math.round((appointments.filter((a) => a.status === 'Completed').length / appointments.length) * 100)}%` },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-sm text-slate-900" style={{ fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
