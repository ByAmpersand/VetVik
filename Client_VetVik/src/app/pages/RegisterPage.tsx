import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PawPrint, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';

type Role = 'owner' | 'doctor' | 'admin';

const roleOptions = [
  { value: 'owner' as Role, label: 'Pet Owner', desc: 'I want to manage my pets and book appointments', emoji: '🐾' },
  { value: 'doctor' as Role, label: 'Veterinarian', desc: 'I am a veterinary doctor or specialist', emoji: '🩺' },
  { value: 'admin' as Role, label: 'Clinic Admin', desc: 'I manage clinic operations and staff', emoji: '🏥' },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('owner');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/${selectedRole}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left: Illustration */}
      <div className="hidden lg:flex w-96 bg-slate-900 flex-col justify-center px-10 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-teal-500/20 rounded-full -translate-y-1/3 -translate-x-1/3" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <span className="text-white" style={{ fontWeight: 700 }}>VetVik</span>
          </button>
          <div className="text-5xl mb-6">🐕</div>
          <h2 className="text-white mb-4" style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3 }}>
            Join thousands of happy pet owners
          </h2>
          <p className="text-slate-400 text-sm mb-8" style={{ lineHeight: 1.7 }}>
            Create your account and start managing your pets' health today.
          </p>
          <div className="space-y-3">
            {['Create your free account in 2 minutes', 'Add unlimited pets', 'Book appointments instantly', 'Access medical history anytime'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900" style={{ fontWeight: 700 }}>VetVik</span>
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h1 className="text-slate-900 mb-1" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create your VetVik account</h1>
            <p className="text-slate-500 text-sm mb-6">Start your free 14-day trial, no credit card required.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="block text-sm text-slate-700 mb-2" style={{ fontWeight: 500 }}>I am a...</label>
                <div className="grid grid-cols-3 gap-2">
                  {roleOptions.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-center ${
                        selectedRole === r.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{r.emoji}</span>
                      <span className="text-xs text-slate-700" style={{ fontWeight: selectedRole === r.value ? 600 : 500 }}>{r.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {roleOptions.find((r) => r.value === selectedRole)?.desc}
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Anna Smith"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="anna@example.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-9 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-9 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength */}
              {form.password && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          form.password.length >= i * 3
                            ? form.password.length >= 12 ? 'bg-green-500' : 'bg-amber-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {form.password.length >= 12 ? '✅ Strong password' : form.password.length >= 6 ? '⚠️ Fair — use 12+ characters' : '❌ Too short'}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-0.5 w-4 h-4 accent-teal-500" required />
                <p className="text-sm text-slate-500">
                  I agree to the{' '}
                  <a href="#" className="text-teal-600" style={{ fontWeight: 500 }}>Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-teal-600" style={{ fontWeight: 500 }}>Privacy Policy</a>
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors mt-2"
                style={{ fontWeight: 600 }}
              >
                Create account
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-teal-600 hover:text-teal-700" style={{ fontWeight: 600 }}>
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
