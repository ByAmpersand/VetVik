import { useNavigate } from 'react-router';
import {
  PawPrint, Calendar, FileText, Stethoscope, CheckCircle,
  ArrowRight, Star, Shield, Clock, ChevronRight, Menu, X,
  Users, BarChart3, Heart,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Calendar,
    title: 'Appointment Scheduling',
    desc: 'Book and manage clinic appointments effortlessly. Real-time availability, automatic reminders, and easy rescheduling.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: PawPrint,
    title: 'Pet Profiles',
    desc: 'Complete pet health profiles with photos, breed info, weight history, microchip data, and health status tracking.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: FileText,
    title: 'Medical History',
    desc: 'Full digital medical records with diagnoses, treatments, prescriptions, and vaccination schedules in one place.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Stethoscope,
    title: 'Doctor Schedule',
    desc: "Manage veterinarians' schedules, workloads, and availability. Optimized time allocation across the clinic.",
    color: 'bg-amber-50 text-amber-600',
  },
];

const roles = [
  {
    role: 'Pet Owners',
    icon: Heart,
    color: 'border-teal-200 bg-teal-50',
    iconColor: 'bg-teal-100 text-teal-600',
    path: '/owner',
    items: [
      'View your pets\' health profiles',
      'Book and track appointments',
      'Access full medical history',
      'Get vaccination reminders',
    ],
  },
  {
    role: 'Veterinarians',
    icon: Stethoscope,
    color: 'border-blue-200 bg-blue-50',
    iconColor: 'bg-blue-100 text-blue-600',
    path: '/doctor',
    items: [
      'Manage daily schedule',
      'View patient information',
      'Write medical notes & prescriptions',
      'Track pending tasks',
    ],
  },
  {
    role: 'Clinic Admins',
    icon: BarChart3,
    color: 'border-purple-200 bg-purple-50',
    iconColor: 'bg-purple-100 text-purple-600',
    path: '/admin',
    items: [
      'Overview clinic operations',
      'Manage all appointments',
      'Monitor doctor workloads',
      'Access analytics and reports',
    ],
  },
];

const steps = [
  { step: '01', title: 'Register', desc: 'Create your VetVik account as a pet owner, doctor, or clinic admin.' },
  { step: '02', title: 'Add Your Pet', desc: 'Add your pet\'s profile with breed, age, and health details.' },
  { step: '03', title: 'Book Appointment', desc: 'Schedule a visit with your preferred veterinarian in seconds.' },
  { step: '04', title: 'Track History', desc: 'All medical records, vaccinations, and visits stored in one place.' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900" style={{ fontSize: '1.1rem', fontWeight: 700 }}>VetVik</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'For Clinics', 'Pricing', 'About'].map((item) => (
              <a key={item} href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors" style={{ fontWeight: 500 }}>
                {item}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm text-slate-700 hover:text-slate-900 transition-colors"
              style={{ fontWeight: 500 }}
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors"
              style={{ fontWeight: 500 }}
            >
              Get Started
            </button>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3">
            {['Features', 'For Clinics', 'Pricing', 'About'].map((item) => (
              <a key={item} href="#" className="block text-sm text-slate-600" style={{ fontWeight: 500 }}>{item}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => navigate('/login')} className="flex-1 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg" style={{ fontWeight: 500 }}>Log in</button>
              <button onClick={() => navigate('/register')} className="flex-1 py-2 bg-teal-500 text-white text-sm rounded-lg" style={{ fontWeight: 500 }}>Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs mb-6" style={{ fontWeight: 600 }}>
              <Star className="w-3 h-3 fill-teal-500" />
              Trusted by 200+ veterinary clinics
            </div>
            <h1 className="text-slate-900 mb-6 leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.15 }}>
              Smart veterinary clinic management for{' '}
              <span className="text-teal-500">pets, doctors, and clinics</span>
            </h1>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto lg:mx-0" style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              VetVik helps veterinary clinics manage appointments, pets, medical history, doctor schedules, and daily operations in one clean dashboard.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Book a visit
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/owner')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                style={{ fontWeight: 600 }}
              >
                View demo
              </button>
            </div>
            <div className="flex flex-wrap gap-5 justify-center lg:justify-start text-sm text-slate-500">
              {['No credit card required', 'Free 14-day trial', 'Cancel anytime'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-500" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Dashboard preview card */}
          <div className="flex-1 w-full max-w-xl">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Mini header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                </div>
                <span className="text-xs text-slate-400 ml-2">vetvik.app/owner/dashboard</span>
              </div>
              <div className="p-4">
                {/* Welcome card */}
                <div className="bg-teal-500 rounded-xl p-4 mb-3 text-white">
                  <p className="text-xs opacity-80 mb-1">Good morning</p>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }}>Anna Smith 👋</p>
                  <p className="text-xs opacity-80 mt-1">3 pets · 1 upcoming appointment</p>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[['3', 'My Pets', 'bg-blue-50 text-blue-600'], ['1', 'Upcoming', 'bg-teal-50 text-teal-600'], ['8', 'Visits', 'bg-green-50 text-green-600']].map(([v, l, c]) => (
                    <div key={l} className={`${c} rounded-lg p-2.5 text-center`}>
                      <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{v}</p>
                      <p className="text-xs opacity-80">{l}</p>
                    </div>
                  ))}
                </div>
                {/* Appointment card */}
                <div className="border border-slate-200 rounded-xl p-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500" style={{ fontWeight: 600 }}>NEXT APPOINTMENT</p>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm">🐕</div>
                    <div>
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Luna — General checkup</p>
                      <p className="text-xs text-slate-500">Dr. Olivia Carter · May 22, 2025 · 10:00 AM</p>
                    </div>
                  </div>
                </div>
                {/* Pet cards row */}
                <div className="flex gap-2">
                  {[['🐕', 'Luna', 'Dog', 'text-emerald-600 bg-emerald-50'], ['🐈', 'Max', 'Cat', 'text-amber-600 bg-amber-50'], ['🐇', 'Bella', 'Rabbit', 'text-emerald-600 bg-emerald-50']].map(([emoji, name, species, badge]) => (
                    <div key={name} className="flex-1 border border-slate-200 rounded-lg p-2 text-center">
                      <div className="text-xl mb-1">{emoji}</div>
                      <p className="text-xs text-slate-900" style={{ fontWeight: 600 }}>{name}</p>
                      <p className="text-xs text-slate-400">{species}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-teal-600 text-sm mb-2" style={{ fontWeight: 600 }}>FEATURES</p>
            <h2 className="text-slate-900 mb-4" style={{ fontSize: '2rem', fontWeight: 700 }}>Everything your clinic needs</h2>
            <p className="text-slate-500 max-w-xl mx-auto">One platform for appointments, pet records, medical history, and doctor management.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-teal-200 hover:shadow-md transition-all">
                  <div className={`w-10 h-10 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-slate-900 mb-2" style={{ fontWeight: 600, fontSize: '0.95rem' }}>{f.title}</h3>
                  <p className="text-slate-500 text-sm" style={{ lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-teal-600 text-sm mb-2" style={{ fontWeight: 600 }}>BUILT FOR EVERYONE</p>
            <h2 className="text-slate-900 mb-4" style={{ fontSize: '2rem', fontWeight: 700 }}>Tailored dashboards for every role</h2>
            <p className="text-slate-500">Different experiences for pet owners, doctors, and clinic administrators.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.role} className={`border-2 ${r.color} rounded-2xl p-6`}>
                  <div className={`w-10 h-10 ${r.iconColor} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-slate-900 mb-3" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{r.role}</h3>
                  <ul className="space-y-2 mb-5">
                    {r.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate(r.path)}
                    className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                    style={{ fontWeight: 600 }}
                  >
                    View demo
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-teal-600 text-sm mb-2" style={{ fontWeight: 600 }}>HOW IT WORKS</p>
            <h2 className="text-slate-900 mb-4" style={{ fontSize: '2rem', fontWeight: 700 }}>Get started in minutes</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-teal-200 z-0" />
                )}
                <div className="relative z-10 w-12 h-12 bg-teal-500 text-white rounded-xl flex items-center justify-center mx-auto mb-4 text-sm" style={{ fontWeight: 700 }}>
                  {s.step}
                </div>
                <h3 className="text-slate-900 mb-2" style={{ fontWeight: 600 }}>{s.title}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'HIPAA Compliant', desc: 'All patient and pet data is encrypted and handled with the highest security standards.', color: 'text-teal-500' },
              { icon: Clock, title: '24/7 Access', desc: 'Access your pet health records and appointment history anytime, from any device.', color: 'text-blue-500' },
              { icon: Users, title: '200+ Clinics', desc: 'Trusted by veterinary clinics across the country to manage their daily operations.', color: 'text-purple-500' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-slate-900 mb-1" style={{ fontWeight: 600 }}>{item.title}</h3>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-teal-500">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-white mb-4" style={{ fontSize: '2rem', fontWeight: 700 }}>Ready to modernize your clinic?</h2>
          <p className="text-teal-100 mb-8">Join hundreds of clinics already using VetVik to streamline their operations and improve pet care.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-white text-teal-600 rounded-xl hover:bg-teal-50 transition-colors"
              style={{ fontWeight: 600 }}
            >
              Start free trial
            </button>
            <button
              onClick={() => navigate('/owner')}
              className="px-6 py-3 bg-teal-600 text-white border border-teal-400 rounded-xl hover:bg-teal-700 transition-colors"
              style={{ fontWeight: 600 }}
            >
              View demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
                  <PawPrint className="w-4 h-4 text-white" />
                </div>
                <span className="text-white" style={{ fontWeight: 700 }}>VetVik</span>
              </div>
              <p className="text-sm max-w-xs">Smart veterinary clinic management for pets, doctors, and clinics.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { title: 'Product', links: ['Features', 'Pricing', 'Demo', 'Changelog'] },
                { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'HIPAA'] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-slate-300 text-sm mb-3" style={{ fontWeight: 600 }}>{col.title}</h4>
                  <ul className="space-y-2">
                    {col.links.map((l) => (
                      <li key={l}><a href="#" className="text-sm hover:text-slate-300 transition-colors">{l}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-sm">© 2025 VetVik. All rights reserved.</p>
            <p className="text-sm">Made with ❤️ for pets everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
