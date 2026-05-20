import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, Edit3, Stethoscope, Syringe, FileText, Clock, AlertCircle, Camera } from 'lucide-react';
import { StatusBadge } from '../../components/DashboardLayout';
import { pets, appointments, medicalRecords, vaccinations, petSpeciesEmoji } from '../../data/mockData';

export function PetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'history' | 'vaccinations'>('overview');
  const [petPhoto, setPetPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pet = pets.find((p) => p.id === id) || pets[0];
  const petAppointments = appointments.filter((a) => a.petId === pet.id);
  const petRecords = medicalRecords.filter((r) => r.petId === pet.id);
  const petVaccinations = vaccinations.filter((v) => v.petId === pet.id);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'history', label: 'Medical History', icon: Stethoscope },
    { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
  ] as const;

  return (
    <div className="p-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/owner/pets')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          style={{ fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Pets
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/owner/appointments')}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Calendar className="w-4 h-4" />
            Book appointment
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50 transition-colors" style={{ fontWeight: 500 }}>
            <Edit3 className="w-4 h-4" />
            Edit pet
          </button>
        </div>
      </div>

      {/* Pet header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 flex flex-wrap items-center gap-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.type.startsWith('image/')) {
              setPetPhoto(URL.createObjectURL(file));
            }
          }}
        />
        <div className="relative group/avatar flex-shrink-0">
          <div className="w-20 h-20 bg-amber-100 rounded-2xl overflow-hidden flex items-center justify-center">
            {petPhoto ? (
              <img src={petPhoto} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">{petSpeciesEmoji[pet.species] || '🐾'}</span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center gap-1 opacity-0 group-hover/avatar:opacity-100 transition-opacity"
          >
            <Camera className="w-5 h-5 text-white" />
            <span className="text-white text-xs" style={{ fontWeight: 600 }}>Change</span>
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{pet.name}</h1>
            <StatusBadge status={pet.healthStatus} />
          </div>
          <p className="text-slate-500 text-sm mb-3">{pet.species} · {pet.breed}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              { label: 'Age', value: `${pet.age} years` },
              { label: 'Gender', value: pet.gender },
              { label: 'Weight', value: pet.weight },
              { label: 'Color', value: pet.color },
              ...(pet.microchip ? [{ label: 'Microchip', value: pet.microchip }] : []),
            ].map((info) => (
              <div key={info.label}>
                <span className="text-slate-400">{info.label}: </span>
                <span className="text-slate-700" style={{ fontWeight: 500 }}>{info.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-1">Last visit</p>
          <p className="text-sm text-slate-700" style={{ fontWeight: 600 }}>{pet.lastVisit}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600 bg-teal-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                style={{ fontWeight: activeTab === tab.id ? 600 : 500 }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-4">
                {/* Basic info */}
                <div className="border border-slate-200 rounded-xl p-4">
                  <h3 className="text-slate-900 mb-3" style={{ fontWeight: 600 }}>Basic Information</h3>
                  <div className="space-y-2">
                    {[
                      ['Name', pet.name],
                      ['Species', pet.species],
                      ['Breed', pet.breed],
                      ['Age', `${pet.age} years`],
                      ['Gender', pet.gender],
                      ['Weight', pet.weight],
                      ['Coat color', pet.color],
                      ...(pet.microchip ? [['Microchip ID', pet.microchip]] : []),
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                        <span className="text-xs text-slate-500">{label}</span>
                        <span className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Owner info */}
                <div className="border border-slate-200 rounded-xl p-4">
                  <h3 className="text-slate-900 mb-3" style={{ fontWeight: 600 }}>Owner Information</h3>
                  <div className="space-y-2">
                    {[
                      ['Name', 'Anna Smith'],
                      ['Phone', '+1 555-100-2000'],
                      ['Email', 'anna@example.com'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                        <span className="text-xs text-slate-500">{label}</span>
                        <span className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Last visit */}
                {petRecords[0] && (
                  <div className="border border-slate-200 rounded-xl p-4">
                    <h3 className="text-slate-900 mb-3" style={{ fontWeight: 600 }}>Last Visit</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Date</span>
                        <span className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{petRecords[0].date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Doctor</span>
                        <span className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{petRecords[0].doctorName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Reason</span>
                        <span className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{petRecords[0].reason}</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-slate-500 mb-1">Diagnosis</p>
                        <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">{petRecords[0].diagnosis}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upcoming appointment */}
                {petAppointments.find((a) => a.status === 'Scheduled') && (
                  <div className="border border-teal-200 bg-teal-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <h3 className="text-teal-800" style={{ fontWeight: 600 }}>Upcoming Appointment</h3>
                    </div>
                    {(() => {
                      const apt = petAppointments.find((a) => a.status === 'Scheduled')!;
                      return (
                        <div className="space-y-1">
                          <p className="text-sm text-teal-900" style={{ fontWeight: 600 }}>{apt.service}</p>
                          <p className="text-xs text-teal-700">{apt.date} · {apt.time}</p>
                          <p className="text-xs text-teal-600">{apt.doctorName}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Vaccination summary */}
                <div className="border border-slate-200 rounded-xl p-4">
                  <h3 className="text-slate-900 mb-3" style={{ fontWeight: 600 }}>Vaccination Status</h3>
                  {petVaccinations.length === 0 ? (
                    <p className="text-xs text-slate-400">No vaccinations recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {petVaccinations.slice(0, 3).map((v) => (
                        <div key={v.id} className="flex items-center justify-between">
                          <span className="text-xs text-slate-700">{v.vaccineName}</span>
                          <StatusBadge status={v.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Appointments tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              {petAppointments.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No appointments found.</p>
                </div>
              ) : (
                petAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{apt.service}</p>
                        <StatusBadge status={apt.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.date} · {apt.time}</span>
                        <span>{apt.doctorName}</span>
                      </div>
                      {apt.notes && <p className="text-xs text-slate-500 mt-1">{apt.notes}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Medical History tab */}
          {activeTab === 'history' && (
            <div className="space-y-0">
              {petRecords.length === 0 ? (
                <div className="text-center py-10">
                  <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No medical records found.</p>
                </div>
              ) : (
                petRecords.map((record, i) => (
                  <div key={record.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      </div>
                      {i < petRecords.length - 1 && <div className="w-px bg-slate-200 flex-1 my-1.5" />}
                    </div>
                    <div className="pb-5 flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{record.reason}</p>
                          <p className="text-xs text-slate-400">{record.date} · {record.doctorName}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 mt-2 space-y-2">
                        <div>
                          <p className="text-xs text-slate-400" style={{ fontWeight: 500 }}>Diagnosis</p>
                          <p className="text-xs text-slate-700">{record.diagnosis}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400" style={{ fontWeight: 500 }}>Treatment</p>
                          <p className="text-xs text-slate-700">{record.treatment}</p>
                        </div>
                        {record.prescription && (
                          <div>
                            <p className="text-xs text-slate-400" style={{ fontWeight: 500 }}>Prescription</p>
                            <p className="text-xs text-slate-700">{record.prescription}</p>
                          </div>
                        )}
                        {record.nextVisit && (
                          <div className="flex items-center gap-1.5 text-xs text-teal-600">
                            <Calendar className="w-3 h-3" />
                            Next visit: {record.nextVisit}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Vaccinations tab */}
          {activeTab === 'vaccinations' && (
            <div className="space-y-3">
              {petVaccinations.length === 0 ? (
                <div className="text-center py-10">
                  <Syringe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No vaccinations recorded.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    {petVaccinations.some((v) => v.status === 'Overdue') && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {petVaccinations.filter((v) => v.status === 'Overdue').length} vaccine(s) overdue
                      </div>
                    )}
                    {petVaccinations.some((v) => v.status === 'Due soon') && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {petVaccinations.filter((v) => v.status === 'Due soon').length} due soon
                      </div>
                    )}
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          {['Vaccine', 'Date Given', 'Next Due', 'Status', 'Administered By'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs text-slate-500" style={{ fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {petVaccinations.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Syringe className="w-3.5 h-3.5 text-teal-500" />
                                <span className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{v.vaccineName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{v.date}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{v.nextDue}</td>
                            <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                            <td className="px-4 py-3 text-sm text-slate-500">{v.administeredBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
