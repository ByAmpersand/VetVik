import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Filter, Clock, FileText, Eye, Play } from 'lucide-react';
import { StatusBadge } from '../../components/DashboardLayout';
import { appointments, petSpeciesEmoji } from '../../data/mockData';
import type { AppointmentStatus } from '../../data/mockData';

const doctorAppointments = appointments.filter((a) => a.doctorId === 'd1');

export function DoctorAppointments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState('date');

  const statuses: (AppointmentStatus | 'All')[] = ['All', 'Scheduled', 'In progress', 'Completed', 'Cancelled'];

  const filtered = doctorAppointments.filter((a) => {
    const matchSearch = a.petName.toLowerCase().includes(search.toLowerCase()) ||
      a.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      a.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    All: doctorAppointments.length,
    Scheduled: doctorAppointments.filter((a) => a.status === 'Scheduled').length,
    'In progress': doctorAppointments.filter((a) => a.status === 'In progress').length,
    Completed: doctorAppointments.filter((a) => a.status === 'Completed').length,
    Cancelled: doctorAppointments.filter((a) => a.status === 'Cancelled').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Appointments</h1>
        <p className="text-slate-500 text-sm mt-0.5">{doctorAppointments.length} total appointments</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
              statusFilter === s
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
            style={{ fontWeight: 500 }}
          >
            {s}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              statusFilter === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`} style={{ fontWeight: 600 }}>
              {counts[s as keyof typeof counts] ?? doctorAppointments.length}
            </span>
          </button>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by pet, owner, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500" style={{ fontWeight: 500 }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm text-slate-700 bg-transparent focus:outline-none"
          >
            <option value="date">Date</option>
            <option value="status">Status</option>
            <option value="pet">Pet name</option>
          </select>
        </div>
        <p className="text-xs text-slate-400 ml-auto">Showing {filtered.length} of {doctorAppointments.length}</p>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No appointments match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Time & Date', 'Pet', 'Owner', 'Service / Reason', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500" style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{apt.time}</p>
                      <p className="text-xs text-slate-400">{apt.date}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{petSpeciesEmoji[apt.petSpecies]}</span>
                        <div>
                          <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{apt.petName}</p>
                          <p className="text-xs text-slate-400">{apt.petSpecies}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{apt.ownerName}</p>
                      <p className="text-xs text-slate-400">{apt.ownerPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{apt.service}</p>
                      {apt.notes && <p className="text-xs text-slate-400 mt-0.5 max-w-36 truncate">{apt.notes}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {apt.status === 'Scheduled' && (
                          <button
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600"
                            style={{ fontWeight: 500 }}
                          >
                            <Play className="w-3 h-3" />
                            Start
                          </button>
                        )}
                        <button
                          onClick={() => navigate('/doctor/notes')}
                          className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50"
                          style={{ fontWeight: 500 }}
                        >
                          <FileText className="w-3 h-3" />
                          Note
                        </button>
                        <button
                          className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50"
                          style={{ fontWeight: 500 }}
                        >
                          <Eye className="w-3 h-3" />
                          Pet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
