import { useState } from 'react';
import { Search, Filter, Mail, Phone, Plus, MoreHorizontal, PawPrint, Calendar, Eye } from 'lucide-react';
import { appointments, pets } from '../../data/mockData';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  petsCount: number;
  petNames: string[];
  lastAppointment: string;
  totalVisits: number;
  joinDate: string;
  initials: string;
}

const clients: Client[] = [
  {
    id: 'owner1',
    name: 'Anna Smith',
    email: 'anna.smith@example.com',
    phone: '+1 (555) 100-2000',
    petsCount: 3,
    petNames: ['Luna', 'Max', 'Bella'],
    lastAppointment: 'May 19, 2025',
    totalVisits: 8,
    joinDate: 'Mar 2024',
    initials: 'AS',
  },
  {
    id: 'owner2',
    name: 'Tom Baker',
    email: 'tom.baker@example.com',
    phone: '+1 (555) 200-3000',
    petsCount: 1,
    petNames: ['Rocky'],
    lastAppointment: 'May 19, 2025',
    totalVisits: 4,
    joinDate: 'Aug 2023',
    initials: 'TB',
  },
  {
    id: 'owner3',
    name: 'Sarah Johnson',
    email: 's.johnson@example.com',
    phone: '+1 (555) 300-4000',
    petsCount: 2,
    petNames: ['Cleo', 'Duke'],
    lastAppointment: 'May 12, 2025',
    totalVisits: 6,
    joinDate: 'Nov 2023',
    initials: 'SJ',
  },
  {
    id: 'owner4',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    phone: '+1 (555) 400-5000',
    petsCount: 1,
    petNames: ['Mochi'],
    lastAppointment: 'Apr 28, 2025',
    totalVisits: 3,
    joinDate: 'Jan 2025',
    initials: 'MC',
  },
  {
    id: 'owner5',
    name: 'Emma Wilson',
    email: 'e.wilson@example.com',
    phone: '+1 (555) 500-6000',
    petsCount: 4,
    petNames: ['Buddy', 'Whiskers', 'Pepper', 'Noodle'],
    lastAppointment: 'May 15, 2025',
    totalVisits: 12,
    joinDate: 'Sep 2022',
    initials: 'EW',
  },
];

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];

export function ClientsManagement() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'visits' | 'date'>('name');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.petNames.some((p) => p.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'visits') return b.totalVisits - a.totalVisits;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Clients</h1>
          <p className="text-slate-500 text-sm mt-0.5">{clients.length} registered clients</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Add client
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Clients', value: clients.length, icon: '👥', bg: 'bg-slate-50' },
          { label: 'Total Pets', value: clients.reduce((sum, c) => sum + c.petsCount, 0), icon: '🐾', bg: 'bg-teal-50' },
          { label: 'Active This Month', value: 4, icon: '📅', bg: 'bg-blue-50' },
          { label: 'Avg. Visits/Client', value: (clients.reduce((sum, c) => sum + c.totalVisits, 0) / clients.length).toFixed(1), icon: '📊', bg: 'bg-amber-50' },
        ].map((card) => (
          <div key={card.label} className={`${card.bg} border border-slate-200 rounded-2xl p-4`}>
            <div className="text-xl mb-2">{card.icon}</div>
            <p className="text-slate-900" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{card.value}</p>
            <p className="text-slate-500 text-xs mt-0.5" style={{ fontWeight: 500 }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or pet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-72"
          />
        </div>
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500" style={{ fontWeight: 500 }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm text-slate-700 bg-transparent focus:outline-none"
          >
            <option value="name">Name</option>
            <option value="visits">Most visits</option>
            <option value="date">Recent activity</option>
          </select>
        </div>
        <p className="text-xs text-slate-400 ml-auto">{sorted.length} clients</p>
      </div>

      {/* Clients table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Client', 'Contact', 'Pets', 'Last Appointment', 'Total Visits', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-500" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((client, idx) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${avatarColors[idx % avatarColors.length]} rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0`} style={{ fontWeight: 700 }}>
                        {client.initials}
                      </div>
                      <div>
                        <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{client.name}</p>
                        <p className="text-xs text-slate-400">Since {client.joinDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <PawPrint className="w-3.5 h-3.5 text-teal-500" />
                      <span className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{client.petsCount}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{client.petNames.slice(0, 2).join(', ')}{client.petNames.length > 2 ? ` +${client.petNames.length - 2}` : ''}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {client.lastAppointment}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-900" style={{ fontWeight: 700 }}>{client.totalVisits}</span>
                      <div className="w-12 bg-slate-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 bg-teal-500 rounded-full"
                          style={{ width: `${Math.min((client.totalVisits / 15) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 border border-teal-200 text-teal-600 rounded-lg text-xs hover:bg-teal-50" style={{ fontWeight: 500 }}>
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === client.id ? null : client.id)}
                          className="p-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        {openMenu === client.id && (
                          <div className="absolute right-0 top-8 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                            {['View profile', 'View pets', 'Book appointment', 'Send message'].map((action) => (
                              <button
                                key={action}
                                onClick={() => setOpenMenu(null)}
                                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
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
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">Showing {sorted.length} of {clients.length} clients</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50" style={{ fontWeight: 500 }}>Previous</button>
            <button className="w-8 h-8 text-xs bg-teal-500 text-white rounded-lg" style={{ fontWeight: 600 }}>1</button>
            <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50" style={{ fontWeight: 500 }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
