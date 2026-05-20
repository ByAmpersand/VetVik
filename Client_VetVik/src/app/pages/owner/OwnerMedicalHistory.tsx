import { useState } from 'react';
import { Search, Filter, Stethoscope, FileText, Syringe, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { medicalRecords, pets, doctors, petSpeciesEmoji } from '../../data/mockData';

const ownerPets = pets.filter((p) => p.ownerId === 'owner1');
const ownerRecords = medicalRecords.filter((r) => ownerPets.find((p) => p.id === r.petId));

export function OwnerMedicalHistory() {
  const [search, setSearch] = useState('');
  const [petFilter, setPetFilter] = useState('All');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = ownerRecords.filter((r) => {
    const matchSearch = r.petName.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(search.toLowerCase());
    const matchPet = petFilter === 'All' || r.petName === petFilter;
    const matchDoctor = doctorFilter === 'All' || r.doctorName === doctorFilter;
    return matchSearch && matchPet && matchDoctor;
  });

  const uniqueDoctors = [...new Set(ownerRecords.map((r) => r.doctorName))];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Medical History</h1>
        <p className="text-slate-500 text-sm mt-0.5">{ownerRecords.length} medical records across {ownerPets.length} pets</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-52"
          />
        </div>
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
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
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
          <span className="text-xs text-slate-500" style={{ fontWeight: 500 }}>Doctor:</span>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="text-sm text-slate-700 bg-transparent focus:outline-none"
          >
            <option>All</option>
            {uniqueDoctors.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
          <span className="text-xs text-slate-500" style={{ fontWeight: 500 }}>Date range:</span>
          <select className="text-sm text-slate-700 bg-transparent focus:outline-none">
            <option>All time</option>
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Records', value: ownerRecords.length, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Diagnoses', value: ownerRecords.filter((r) => r.diagnosis).length, icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Prescriptions', value: ownerRecords.filter((r) => r.prescription).length, icon: Syringe, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Upcoming Follow-ups', value: ownerRecords.filter((r) => r.nextVisit).length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className={`w-8 h-8 ${card.bg} ${card.color} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-slate-900" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{card.value}</p>
              <p className="text-slate-500 text-xs mt-0.5" style={{ fontWeight: 500 }}>{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl text-center py-16">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-700 mb-2" style={{ fontWeight: 600 }}>No records found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-0">
          {filtered.map((record, i) => {
            const pet = ownerPets.find((p) => p.id === record.petId);
            const isExpanded = expandedId === record.id;
            return (
              <div key={record.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center flex-shrink-0 w-8">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white">
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                  {i < filtered.length - 1 && (
                    <div className="w-0.5 bg-teal-100 flex-1 mt-1" style={{ minHeight: '2rem' }} />
                  )}
                </div>

                {/* Record card */}
                <div className="flex-1 pb-5">
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-teal-200 transition-colors">
                    <div
                      className="flex items-start gap-4 p-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    >
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {petSpeciesEmoji[pet?.species || 'Dog']}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                            {record.petName}
                          </span>
                          <span className="text-xs text-slate-400">{record.date}</span>
                        </div>
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>{record.reason}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{record.doctorName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 mb-0.5">Diagnosis</p>
                          <p className="text-xs text-slate-700 max-w-32 truncate" style={{ fontWeight: 500 }}>{record.diagnosis}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>DIAGNOSIS</p>
                            <p className="text-sm text-slate-700">{record.diagnosis}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>TREATMENT</p>
                            <p className="text-sm text-slate-700">{record.treatment}</p>
                          </div>
                          {record.prescription && (
                            <div>
                              <p className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>PRESCRIPTION</p>
                              <div className="flex items-center gap-2">
                                <Syringe className="w-3.5 h-3.5 text-blue-500" />
                                <p className="text-sm text-slate-700">{record.prescription}</p>
                              </div>
                            </div>
                          )}
                          {record.nextVisit && (
                            <div>
                              <p className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>FOLLOW-UP</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-teal-500" />
                                <p className="text-sm text-teal-700" style={{ fontWeight: 500 }}>{record.nextVisit}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <button className="px-3 py-1.5 border border-teal-200 text-teal-600 rounded-xl text-xs hover:bg-teal-50" style={{ fontWeight: 500 }}>
                            View full details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
