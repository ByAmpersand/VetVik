import { useNavigate } from 'react-router';
import {
  PawPrint, Calendar, Plus, ArrowRight, Clock, Stethoscope,
  FileText, Activity, ChevronRight, TrendingUp,
} from 'lucide-react';
import { StatusBadge } from '../../components/DashboardLayout';
import { appointments, pets, medicalRecords, petSpeciesEmoji } from '../../data/mockData';

const ownerAppointments = appointments.filter((a) => a.ownerId === 'owner1');
const ownerPets = pets.filter((p) => p.ownerId === 'owner1');
const upcoming = ownerAppointments.filter((a) => a.status === 'Scheduled');
const completed = ownerAppointments.filter((a) => a.status === 'Completed');
const ownerRecords = medicalRecords.filter((r) => ownerPets.find((p) => p.id === r.petId));

export function OwnerDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'My Pets', value: ownerPets.length, icon: PawPrint, color: 'text-teal-600', bg: 'bg-teal-50', path: '/owner/pets' },
    { label: 'Upcoming Visits', value: upcoming.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', path: '/owner/appointments' },
    { label: 'Completed Visits', value: completed.length, icon: Activity, color: 'text-green-600', bg: 'bg-green-50', path: '/owner/appointments' },
    { label: 'Active Treatments', value: 1, icon: Stethoscope, color: 'text-amber-600', bg: 'bg-amber-50', path: '/owner/medical-history' },
  ];

  return (
    <div className="flex gap-6 p-6 min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Welcome card */}
        <div className="bg-teal-500 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-teal-400 rounded-full -translate-y-1/4 translate-x-1/4 opacity-50" />
          <div className="absolute right-12 bottom-0 w-20 h-20 bg-teal-600 rounded-full translate-y-1/3 opacity-40" />
          <div className="relative z-10">
            <p className="text-teal-100 text-sm mb-1">Good morning 👋</p>
            <h2 className="mb-1" style={{ fontSize: '1.4rem', fontWeight: 700 }}>Anna Smith</h2>
            <p className="text-teal-100 text-sm mb-4">Here is what is happening with your pets today.</p>
            <button
              onClick={() => navigate('/owner/appointments')}
              className="flex items-center gap-2 bg-white text-teal-600 px-4 py-2 rounded-xl text-sm hover:bg-teal-50 transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Plus className="w-4 h-4" />
              Book appointment
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                onClick={() => navigate(s.path)}
                className="bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-teal-200 hover:shadow-sm transition-all group"
              >
                <div className={`w-9 h-9 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5" style={{ fontWeight: 500 }}>{s.label}</p>
              </button>
            );
          })}
        </div>

        {/* Upcoming appointments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900" style={{ fontWeight: 700 }}>Upcoming Appointments</h3>
            <button
              onClick={() => navigate('/owner/appointments')}
              className="text-xs text-teal-600 flex items-center gap-1 hover:text-teal-700"
              style={{ fontWeight: 500 }}
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No upcoming appointments</p>
              <button onClick={() => navigate('/owner/appointments')} className="mt-3 text-sm text-teal-600" style={{ fontWeight: 500 }}>
                Book one now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-teal-50/50 transition-colors">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                    {petSpeciesEmoji[apt.petSpecies] || '🐾'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{apt.petName}</p>
                      <span className="text-slate-400 text-xs">·</span>
                      <p className="text-slate-500 text-xs">{apt.service}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.date} · {apt.time}</span>
                      <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" />{apt.doctorName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status} />
                    <button
                      onClick={() => navigate('/owner/appointments')}
                      className="text-xs text-teal-600 hover:text-teal-700 px-3 py-1.5 bg-white border border-teal-200 rounded-lg"
                      style={{ fontWeight: 500 }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Pets preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900" style={{ fontWeight: 700 }}>My Pets</h3>
            <button
              onClick={() => navigate('/owner/pets')}
              className="text-xs text-teal-600 flex items-center gap-1 hover:text-teal-700"
              style={{ fontWeight: 500 }}
            >
              Manage pets <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ownerPets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => navigate(`/owner/pets/${pet.id}`)}
                className="flex flex-col items-center p-4 bg-slate-50 rounded-xl hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-all text-center"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl mb-2">
                  {petSpeciesEmoji[pet.species] || '🐾'}
                </div>
                <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{pet.name}</p>
                <p className="text-slate-400 text-xs">{pet.breed}</p>
                <div className="mt-2">
                  <StatusBadge status={pet.healthStatus} />
                </div>
              </button>
            ))}
            <button
              onClick={() => navigate('/owner/pets')}
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-all text-center"
            >
              <Plus className="w-5 h-5 text-slate-400 mb-1" />
              <p className="text-slate-400 text-xs" style={{ fontWeight: 500 }}>Add pet</p>
            </button>
          </div>
        </div>

        {/* Recent medical history */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900" style={{ fontWeight: 700 }}>Recent Medical History</h3>
            <button
              onClick={() => navigate('/owner/medical-history')}
              className="text-xs text-teal-600 flex items-center gap-1 hover:text-teal-700"
              style={{ fontWeight: 500 }}
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-0">
            {ownerRecords.slice(0, 3).map((record, i) => (
              <div key={record.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  {i < ownerRecords.slice(0, 3).length - 1 && (
                    <div className="w-px bg-slate-200 flex-1 my-1" />
                  )}
                </div>
                <div className="pb-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">{record.date}</span>
                    <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                      {record.petName}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{record.reason}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{record.diagnosis}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{record.doctorName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 flex-shrink-0 space-y-4 hidden xl:block">
        {/* Next visit reminder */}
        {upcoming[0] && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>NEXT VISIT</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">
                {petSpeciesEmoji[upcoming[0].petSpecies] || '🐾'}
              </div>
              <div>
                <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{upcoming[0].petName}</p>
                <p className="text-xs text-slate-500">{upcoming[0].service}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-500 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{upcoming[0].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{upcoming[0].time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                <span>{upcoming[0].doctorName}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/owner/appointments')}
              className="w-full py-2 border border-teal-200 text-teal-600 rounded-xl text-sm hover:bg-teal-50 transition-colors"
              style={{ fontWeight: 500 }}
            >
              View details
            </button>
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>QUICK ACTIONS</p>
          <div className="space-y-2">
            {[
              { label: 'Add a pet', icon: PawPrint, path: '/owner/pets', color: 'text-teal-600 bg-teal-50' },
              { label: 'Book appointment', icon: Calendar, path: '/owner/appointments', color: 'text-blue-600 bg-blue-50' },
              { label: 'Medical history', icon: FileText, path: '/owner/medical-history', color: 'text-purple-600 bg-purple-50' },
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

        {/* Health tip */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-xs text-amber-700 mb-2" style={{ fontWeight: 600 }}>💡 HEALTH TIP</p>
          <p className="text-sm text-amber-800">Max's Rabies vaccination is overdue. Schedule a vaccination appointment soon.</p>
          <button
            onClick={() => navigate('/owner/appointments')}
            className="mt-3 text-xs text-amber-700 hover:text-amber-800 flex items-center gap-1"
            style={{ fontWeight: 600 }}
          >
            Book now <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Stats card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>THIS YEAR</p>
          <div className="space-y-3">
            {[
              { label: 'Total visits', value: '8', trend: '+2', up: true },
              { label: 'Vaccinations', value: '3', trend: '0', up: true },
              { label: 'Prescriptions', value: '2', trend: '+1', up: true },
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
