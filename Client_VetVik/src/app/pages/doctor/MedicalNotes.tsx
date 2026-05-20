import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, User, Stethoscope, Syringe, FileText, Save, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/DashboardLayout';
import { appointments, medicalRecords, vaccinations, petSpeciesEmoji, pets } from '../../data/mockData';

const apt = appointments.find((a) => a.id === 'a7') || appointments[0];
const pet = pets.find((p) => p.id === apt.petId) || pets[0];
const petRecords = medicalRecords.filter((r) => r.petId === pet.id);
const petVaccinations = vaccinations.filter((v) => v.petId === pet.id);

export function MedicalNotes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    recommendations: '',
    followUpDate: '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (complete = false) => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate('/doctor/appointments')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm"
          style={{ fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to appointments
        </button>
        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              Saved
            </div>
          )}
          <button
            onClick={() => handleSave(false)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Save className="w-4 h-4" />
            Save draft
          </button>
          <button
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <CheckCircle className="w-4 h-4" />
            Complete visit
          </button>
        </div>
      </div>

      {/* Appointment header card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            {petSpeciesEmoji[apt.petSpecies]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-slate-900" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{apt.petName}</h2>
              <StatusBadge status={apt.status} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Owner: {apt.ownerName} · {apt.ownerPhone}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{apt.date} · {apt.time}</span>
              <span className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" />{apt.service}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Left: Pet info + history */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pet info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-slate-900 mb-3" style={{ fontWeight: 700 }}>Pet Information</h3>
            <div className="space-y-2">
              {[
                ['Name', pet.name],
                ['Species', pet.species],
                ['Breed', pet.breed],
                ['Age', `${pet.age} years`],
                ['Gender', pet.gender],
                ['Weight', pet.weight],
                ...(pet.microchip ? [['Microchip', pet.microchip]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Previous medical history */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-slate-900 mb-3" style={{ fontWeight: 700 }}>Previous Visits</h3>
            {petRecords.length === 0 ? (
              <p className="text-xs text-slate-400">No previous records.</p>
            ) : (
              <div className="space-y-3">
                {petRecords.map((record) => (
                  <div key={record.id} className="border border-slate-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-600" style={{ fontWeight: 600 }}>{record.reason}</p>
                      <span className="text-xs text-slate-400">{record.date}</span>
                    </div>
                    <p className="text-xs text-slate-500">{record.diagnosis}</p>
                    {record.prescription && (
                      <p className="text-xs text-blue-600 mt-1">Rx: {record.prescription}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vaccination info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-slate-900 mb-3" style={{ fontWeight: 700 }}>Vaccinations</h3>
            {petVaccinations.length === 0 ? (
              <p className="text-xs text-slate-400">No vaccination records.</p>
            ) : (
              <div className="space-y-2">
                {petVaccinations.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-3.5 h-3.5 text-teal-500" />
                      <span className="text-xs text-slate-700" style={{ fontWeight: 500 }}>{v.vaccineName}</span>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Medical note form */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-slate-900" style={{ fontWeight: 700 }}>Medical Notes</h3>
              <span className="text-xs text-slate-400 ml-auto">Auto-saved every 30s</span>
            </div>

            <div className="space-y-4">
              {/* Symptoms */}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-700 mb-2" style={{ fontWeight: 600 }}>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  Symptoms & Chief Complaint
                </label>
                <textarea
                  value={notes.symptoms}
                  onChange={(e) => setNotes({ ...notes, symptoms: e.target.value })}
                  placeholder="Describe the patient's symptoms and reason for visit..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-700 mb-2" style={{ fontWeight: 600 }}>
                  <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                  Diagnosis
                </label>
                <textarea
                  value={notes.diagnosis}
                  onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })}
                  placeholder="Clinical diagnosis based on examination..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Treatment */}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-700 mb-2" style={{ fontWeight: 600 }}>
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Treatment Performed
                </label>
                <textarea
                  value={notes.treatment}
                  onChange={(e) => setNotes({ ...notes, treatment: e.target.value })}
                  placeholder="Describe the treatment or procedure performed..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Prescription */}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-700 mb-2" style={{ fontWeight: 600 }}>
                  <Syringe className="w-3.5 h-3.5 text-purple-500" />
                  Prescription
                </label>
                <textarea
                  value={notes.prescription}
                  onChange={(e) => setNotes({ ...notes, prescription: e.target.value })}
                  placeholder="Medications, dosage, and duration..."
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Recommendations */}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-700 mb-2" style={{ fontWeight: 600 }}>
                  <FileText className="w-3.5 h-3.5 text-teal-500" />
                  Recommendations & Notes
                </label>
                <textarea
                  value={notes.recommendations}
                  onChange={(e) => setNotes({ ...notes, recommendations: e.target.value })}
                  placeholder="Care instructions, dietary recommendations, activity restrictions..."
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Follow-up */}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-700 mb-2" style={{ fontWeight: 600 }}>
                  <Calendar className="w-3.5 h-3.5 text-teal-500" />
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={notes.followUpDate}
                  onChange={(e) => setNotes({ ...notes, followUpDate: e.target.value })}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleSave(false)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <Save className="w-4 h-4" />
                  Save draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  className="flex items-center gap-2 flex-1 justify-center py-2.5 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete visit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
