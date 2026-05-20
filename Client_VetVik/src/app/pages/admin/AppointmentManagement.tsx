import { useState } from 'react';
import { Search, Filter, Plus, Eye, Edit3, X, CheckCircle, MoreHorizontal } from 'lucide-react';
import { StatusBadge } from '../../components/DashboardLayout';
import { appointments, doctors, serviceTypes, petSpeciesEmoji } from '../../data/mockData';
import type { AppointmentStatus } from '../../data/mockData';

export function AppointmentManagement() {
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'All'>('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = appointments.filter((a) => {
    const matchSearch = a.petName.toLowerCase().includes(search.toLowerCase()) ||
      a.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchDoctor = doctorFilter === 'All' || a.doctorName.includes(doctorFilter);
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchService = serviceFilter === 'All' || a.service === serviceFilter;
    return matchSearch && matchDoctor && matchStatus && matchService;
  });

  const counts = {
    All: appointments.length,
    Scheduled: appointments.filter((a) => a.status === 'Scheduled').length,
    'In progress': appointments.filter((a) => a.status === 'In progress').length,
    Completed: appointments.filter((a) => a.status === 'Completed').length,
    Cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
  };

  const statuses: (AppointmentStatus | 'All')[] = ['All', 'Scheduled', 'In progress', 'Completed', 'Cancelled'];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Appointment Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">{appointments.length} total appointments</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Create appointment
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
              statusFilter === s
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
            style={{ fontWeight: 500 }}
          >
            {s}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              statusFilter === s ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
            }`} style={{ fontWeight: 600 }}>
              {counts[s as keyof typeof counts] ?? appointments.length}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by pet, owner, or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-72"
          />
        </div>
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="text-sm text-slate-700 bg-transparent focus:outline-none"
          >
            <option>All doctors</option>
            {doctors.map((d) => <option key={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="text-sm text-slate-700 bg-transparent focus:outline-none"
          >
            <option>All services</option>
            {serviceTypes.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <p className="text-xs text-slate-400 ml-auto">Showing {filtered.length} of {appointments.length}</p>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Pet', 'Owner', 'Doctor', 'Date & Time', 'Service', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-500" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50 transition-colors group">
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
                    <p className="text-sm text-slate-700">{apt.ownerName}</p>
                    <p className="text-xs text-slate-400">{apt.ownerPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{apt.doctorName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{apt.time}</p>
                    <p className="text-xs text-slate-400">{apt.date}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700">{apt.service}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={apt.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
                      <button className="p-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                        <button className="p-1.5 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === apt.id ? null : apt.id)}
                          className="p-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        {openMenu === apt.id && (
                          <div className="absolute right-0 top-8 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                            {['Edit', 'Reschedule', 'Cancel', 'Delete'].map((action, i) => (
                              <button
                                key={action}
                                onClick={() => setOpenMenu(null)}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${
                                  action === 'Delete' || action === 'Cancel' ? 'text-red-600' : 'text-slate-700'
                                }`}
                                style={{ fontWeight: 500 }}
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">Showing {filtered.length} results</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50" style={{ fontWeight: 500 }}>Previous</button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 text-xs rounded-lg transition-colors ${p === 1 ? 'bg-teal-500 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                style={{ fontWeight: 500 }}
              >
                {p}
              </button>
            ))}
            <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50" style={{ fontWeight: 500 }}>Next</button>
          </div>
        </div>
      </div>

      {/* Create appointment modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Create Appointment</h2>
              <button onClick={() => setCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Pet name</label>
                  <input placeholder="Pet name" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Owner name</label>
                  <input placeholder="Owner name" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Doctor</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    {doctors.map((d) => <option key={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Service</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    {serviceTypes.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Time</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Notes</label>
                <textarea rows={3} placeholder="Additional notes..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setCreateOpen(false)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50" style={{ fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={() => setCreateOpen(false)} className="flex-1 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600" style={{ fontWeight: 600 }}>
                Create appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
