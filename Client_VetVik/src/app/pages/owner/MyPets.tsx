import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Filter, MoreHorizontal, ArrowRight, Camera, Upload, X } from 'lucide-react';
import { StatusBadge } from '../../components/DashboardLayout';
import { pets, petSpeciesEmoji } from '../../data/mockData';

const ownerPets = pets.filter((p) => p.ownerId === 'owner1');

export function MyPets() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [addPetOpen, setAddPetOpen] = useState(false);
  const [petPhoto, setPetPhoto] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPetPhoto(url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePhotoFile(file);
  }

  const species = ['All', 'Dog', 'Cat', 'Rabbit'];

  const filtered = ownerPets.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.breed.toLowerCase().includes(search.toLowerCase());
    const matchSpecies = speciesFilter === 'All' || p.species === speciesFilter;
    return matchSearch && matchSpecies;
  });

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Pets</h1>
          <p className="text-slate-500 text-sm mt-0.5">{ownerPets.length} pets registered</p>
        </div>
        <button
          onClick={() => setAddPetOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Add pet
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500" style={{ fontWeight: 500 }}>Species:</span>
          <div className="flex gap-1">
            {species.map((s) => (
              <button
                key={s}
                onClick={() => setSpeciesFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  speciesFilter === s ? 'bg-teal-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
                style={{ fontWeight: 500 }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pet grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-slate-700 mb-2" style={{ fontWeight: 600, fontSize: '1.1rem' }}>No pets found</h3>
          <p className="text-slate-500 text-sm mb-6">
            {search || speciesFilter !== 'All' ? 'Try adjusting your filters.' : "You haven't added any pets yet."}
          </p>
          {!search && speciesFilter === 'All' && (
            <button
              onClick={() => setAddPetOpen(true)}
              className="px-6 py-2.5 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
              style={{ fontWeight: 600 }}
            >
              Add your first pet
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((pet) => (
            <div key={pet.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-teal-200 hover:shadow-md transition-all group">
              {/* Pet header */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center relative">
                <button className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/50 text-slate-400">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <div className="relative inline-block mb-2">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-amber-100 mx-auto">
                    {pet.photo ? (
                      <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{petSpeciesEmoji[pet.species] || '🐾'}</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setAddPetOpen(true); }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-teal-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{pet.name}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{pet.breed}</p>
                <div className="mt-2">
                  <StatusBadge status={pet.healthStatus} />
                </div>
              </div>

              {/* Pet info */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'Species', value: pet.species },
                    { label: 'Age', value: `${pet.age} yrs` },
                    { label: 'Gender', value: pet.gender },
                    { label: 'Weight', value: pet.weight },
                  ].map((info) => (
                    <div key={info.label}>
                      <p className="text-xs text-slate-400" style={{ fontWeight: 500 }}>{info.label}</p>
                      <p className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{info.value}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Last visit: <span className="text-slate-600">{pet.lastVisit}</span></p>
                  <button
                    onClick={() => navigate(`/owner/pets/${pet.id}`)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    Open profile <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add pet card */}
          <button
            onClick={() => setAddPetOpen(true)}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-teal-300 hover:bg-teal-50/30 transition-all min-h-64"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-slate-600 text-sm" style={{ fontWeight: 600 }}>Add a new pet</p>
              <p className="text-slate-400 text-xs mt-1">Register your pet's profile</p>
            </div>
          </button>
        </div>
      )}

      {/* Add Pet Modal */}
      {addPetOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Add a new pet</h2>
              <button onClick={() => { setAddPetOpen(false); setPetPhoto(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo upload */}
            <div className="mb-5">
              <label className="block text-xs text-slate-600 mb-2" style={{ fontWeight: 500 }}>Pet photo (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoFile(f); }}
              />
              {petPhoto ? (
                <div className="relative inline-flex">
                  <img src={petPhoto} alt="Pet preview" className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-200" />
                  <button
                    onClick={() => setPetPhoto(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500" style={{ fontWeight: 500 }}>Drop a photo here or <span className="text-teal-600">browse</span></p>
                  <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Pet name</label>
                  <input placeholder="e.g. Luna" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Species</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    <option>Dog</option><option>Cat</option><option>Rabbit</option><option>Bird</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Breed</label>
                  <input placeholder="e.g. Golden Retriever" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Age</label>
                  <input type="number" placeholder="Years" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Gender</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    <option>Female</option><option>Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Weight</label>
                  <input placeholder="e.g. 5.2 kg" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Microchip number (optional)</label>
                <input placeholder="e.g. MC-2024-001" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setAddPetOpen(false); setPetPhoto(null); }} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50" style={{ fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={() => { setAddPetOpen(false); setPetPhoto(null); }} className="flex-1 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600" style={{ fontWeight: 600 }}>
                Add pet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
