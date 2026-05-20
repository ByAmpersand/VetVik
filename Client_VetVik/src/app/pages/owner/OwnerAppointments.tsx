import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Filter, Search, Clock, Stethoscope, X, Calendar, ChevronDown } from 'lucide-react';
import { StatusBadge } from '../../components/DashboardLayout';
import { appointments, pets, doctors, serviceTypes, timeSlots, petSpeciesEmoji } from '../../data/mockData';
import type { AppointmentStatus } from '../../data/mockData';

const ownerAppointments = appointments.filter((a) => a.ownerId === 'owner1');
const ownerPets = pets.filter((p) => p.ownerId === 'owner1');

export function OwnerAppointments() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [petFilter, setPetFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [booking, setBooking] = useState({
    petId: '',
    service: '',
    doctorId: '',
    date: '',
    time: '',
    notes: '',
  });

  const statuses: (AppointmentStatus | 'All')[] = ['All', 'Scheduled', 'In progress', 'Completed', 'Cancelled'];

  const filtered = ownerAppointments.filter((a) => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchPet = petFilter === 'All' || a.petName === petFilter;
    const matchSearch = a.petName.toLowerCase().includes(search.toLowerCase()) ||
      a.service.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPet && matchSearch;
  });

  const statusColors: Record<string, string> = {
    All: 'bg-slate-100 text-slate-600',
    Scheduled: 'bg-blue-100 text-blue-700',
    'In progress': 'bg-amber-100 text-amber-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Appointments</h1>
          <p className="text-slate-500 text-sm mt-0.5">{ownerAppointments.length} total appointments</p>
        </div>
        <button
          onClick={() => { setBookingOpen(true); setBookingStep(1); }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Book appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-52"
          />
        </div>

        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 mr-1" style={{ fontWeight: 500 }}>Status:</span>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                statusFilter === s ? statusColors[s] : 'text-slate-500 hover:bg-slate-50'
              }`}
              style={{ fontWeight: statusFilter === s ? 600 : 500 }}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
          <span className="text-xs text-slate-500" style={{ fontWeight: 500 }}>Pet:</span>
          <select
            value={petFilter}
            onChange={(e) => setPetFilter(e.target.value)}
            className="text-sm text-slate-700 bg-transparent focus:outline-none"
          >
            <option>All</option>
            {ownerPets.map((p) => <option key={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Appointments list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl text-center py-16">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-700 mb-2" style={{ fontWeight: 600 }}>No appointments found</h3>
            <p className="text-slate-500 text-sm mb-5">Try adjusting your filters or book a new appointment.</p>
            <button
              onClick={() => setBookingOpen(true)}
              className="px-5 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
              style={{ fontWeight: 600 }}
            >
              Book appointment
            </button>
          </div>
        ) : (
          filtered.map((apt) => (
            <div key={apt.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-200 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {petSpeciesEmoji[apt.petSpecies] || '🐾'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-slate-900" style={{ fontWeight: 600 }}>{apt.petName}</p>
                    <span className="text-slate-300">·</span>
                    <p className="text-slate-600 text-sm">{apt.service}</p>
                    <StatusBadge status={apt.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.date} at {apt.time}</span>
                    <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" />{apt.doctorName}</span>
                  </div>
                  {apt.notes && (
                    <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg">{apt.notes}</p>
                  )}
                  {apt.diagnosis && (
                    <p className="text-xs text-slate-600 mt-1.5">Diagnosis: <span className="text-slate-700">{apt.diagnosis}</span></p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {apt.status === 'Scheduled' && (
                    <>
                      <button className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50" style={{ fontWeight: 500 }}>
                        Reschedule
                      </button>
                      <button className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50" style={{ fontWeight: 500 }}>
                        Cancel
                      </button>
                    </>
                  )}
                  <button className="px-3 py-1.5 text-xs border border-teal-200 text-teal-600 rounded-lg hover:bg-teal-50" style={{ fontWeight: 500 }}>
                    View
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {bookingOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-slate-900" style={{ fontWeight: 700 }}>Book an appointment</h2>
                <p className="text-xs text-slate-500 mt-0.5">Step {bookingStep} of 3</p>
              </div>
              <button onClick={() => setBookingOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step progress */}
            <div className="flex px-5 pt-4 gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= bookingStep ? 'bg-teal-500' : 'bg-slate-200'}`} />
              ))}
            </div>

            <div className="p-5 space-y-4">
              {bookingStep === 1 && (
                <>
                  <h3 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Select pet & service</h3>
                  <div>
                    <label className="block text-xs text-slate-600 mb-2" style={{ fontWeight: 500 }}>Select pet</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ownerPets.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setBooking({ ...booking, petId: p.id })}
                          className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                            booking.petId === p.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xl mb-1">{petSpeciesEmoji[p.species]}</span>
                          <span className="text-xs text-slate-700" style={{ fontWeight: 600 }}>{p.name}</span>
                          <span className="text-xs text-slate-400">{p.species}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-2" style={{ fontWeight: 500 }}>Service type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceTypes.slice(0, 6).map((s) => (
                        <button
                          key={s}
                          onClick={() => setBooking({ ...booking, service: s })}
                          className={`py-2 px-3 rounded-xl border-2 text-left text-xs transition-all ${
                            booking.service === s ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                          style={{ fontWeight: 500 }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {bookingStep === 2 && (
                <>
                  <h3 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Select doctor & time</h3>
                  <div>
                    <label className="block text-xs text-slate-600 mb-2" style={{ fontWeight: 500 }}>Select doctor</label>
                    <div className="space-y-2">
                      {doctors.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setBooking({ ...booking, doctorId: d.id })}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            booking.doctorId === d.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-700" style={{ fontWeight: 700 }}>
                            {d.avatar}
                          </div>
                          <div>
                            <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{d.name}</p>
                            <p className="text-xs text-slate-500">{d.specialization}</p>
                          </div>
                          <StatusBadge status={d.status} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Date</label>
                      <input
                        type="date"
                        value={booking.date}
                        onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Time</label>
                      <select
                        value={booking.time}
                        onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="">Select time</option>
                        {timeSlots.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {bookingStep === 3 && (
                <>
                  <h3 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Review & confirm</h3>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    {[
                      ['Pet', ownerPets.find((p) => p.id === booking.petId)?.name || '—'],
                      ['Service', booking.service || '—'],
                      ['Doctor', doctors.find((d) => d.id === booking.doctorId)?.name || '—'],
                      ['Date', booking.date || '—'],
                      ['Time', booking.time || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-slate-800" style={{ fontWeight: 500 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Notes (optional)</label>
                    <textarea
                      value={booking.notes}
                      onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                      placeholder="Describe the reason for the visit..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-100">
              {bookingStep > 1 && (
                <button
                  onClick={() => setBookingStep(bookingStep - 1)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50"
                  style={{ fontWeight: 500 }}
                >
                  Back
                </button>
              )}
              <button
                onClick={() => {
                  if (bookingStep < 3) setBookingStep(bookingStep + 1);
                  else setBookingOpen(false);
                }}
                className="flex-1 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600"
                style={{ fontWeight: 600 }}
              >
                {bookingStep < 3 ? 'Continue' : 'Confirm appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
