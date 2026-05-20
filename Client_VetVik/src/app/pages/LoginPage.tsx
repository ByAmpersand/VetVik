import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PawPrint, Eye, EyeOff, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const demoRoles = [
    { label: 'Pet Owner', path: '/owner', color: 'bg-teal-500', desc: 'Anna Smith' },
    { label: 'Veterinarian', path: '/doctor', color: 'bg-blue-500', desc: 'Dr. Olivia Carter' },
    { label: 'Admin', path: '/admin', color: 'bg-purple-500', desc: 'James Peterson' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900" style={{ fontSize: '1.2rem', fontWeight: 700 }}>VetVik</span>
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h1 className="text-slate-900 mb-1" style={{ fontSize: '1.6rem', fontWeight: 700 }}>Welcome back</h1>
            <p className="text-slate-500 text-sm mb-7">Sign in to your VetVik account</p>

            <form onSubmit={(e) => { e.preventDefault(); navigate('/owner'); }} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anna@example.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-teal-500"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-teal-600 hover:text-teal-700" style={{ fontWeight: 500 }}>
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Sign in
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <button onClick={() => navigate('/register')} className="text-teal-600 hover:text-teal-700" style={{ fontWeight: 600 }}>
                  Create an account
                </button>
              </p>
            </div>
          </div>

          {/* Demo shortcuts */}
          <div className="mt-6">
            <p className="text-center text-sm text-slate-500 mb-3">Or try a demo role directly:</p>
            <div className="grid grid-cols-3 gap-3">
              {demoRoles.map((r) => (
                <button
                  key={r.path}
                  onClick={() => navigate(r.path)}
                  className={`${r.color} text-white rounded-xl py-3 px-3 text-center hover:opacity-90 transition-opacity`}
                >
                  <p className="text-xs" style={{ fontWeight: 700 }}>{r.label}</p>
                  <p className="text-xs opacity-80 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Illustration */}
      <div className="hidden lg:flex flex-1 bg-teal-500 flex-col justify-center items-center px-12 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400 rounded-full -translate-y-1/3 translate-x-1/3 opacity-50" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-600 rounded-full translate-y-1/3 -translate-x-1/3 opacity-40" />

        <div className="relative z-10 text-center text-white">
          <div className="text-7xl mb-6">🐾</div>
          <h2 className="mb-4" style={{ fontSize: '1.8rem', fontWeight: 700 }}>Your pets deserve the best care</h2>
          <p className="text-teal-100 mb-8" style={{ lineHeight: 1.7 }}>
            VetVik connects pet owners, veterinarians, and clinic administrators for seamless veterinary care management.
          </p>

          {/* Feature list */}
          <div className="space-y-3 text-left">
            {['Manage all your pets in one place', 'Track appointments and medical history', 'Get vaccination reminders', 'Connect with your vet easily'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="text-sm text-teal-50">{item}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[['200+', 'Clinics'], ['50k+', 'Pets cared'], ['98%', 'Satisfaction']].map(([v, l]) => (
              <div key={l} className="bg-white/10 rounded-xl p-3">
                <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>{v}</p>
                <p className="text-teal-100 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
