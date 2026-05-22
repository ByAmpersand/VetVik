import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  PawPrint,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { roleHomePath } from '../../auth/roles';
import { PrimaryButton, Surface } from '../../components/redesign/VetVikUI';
import {
  formatApiError,
  mapApiErrorsToFields,
  validateEmail,
  validateName,
  validatePassword,
  validateRequired,
} from '../../utils/formValidation';

export function PremiumLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f8f3] text-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-teal-200/45 blur-3xl" />
        <div className="absolute right-10 top-1/3 h-96 w-96 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <button onClick={() => navigate('/')} className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-[1.35rem] bg-slate-950 text-white shadow-xl shadow-slate-950/20">
            <PawPrint className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-xl font-black tracking-[-0.06em]">VetVik</p>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Veterinary clinic</p>
          </div>
        </button>
        <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 md:flex">
          <a href="#services" className="hover:text-teal-700">Services</a>
          <a href="#workflow" className="hover:text-teal-700">How it works</a>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/login')} className="hidden rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white/70 sm:block">
            Log in
          </button>
          <PrimaryButton onClick={() => navigate('/register')} icon={ArrowRight}>Book a visit</PrimaryButton>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 lg:pt-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Your trusted veterinary clinic
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.08em] text-slate-950 md:text-7xl">
            Professional care for your pets, right here at VetVik.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            VetVik is a modern veterinary clinic where clients and our team stay connected — online booking, medical records, and clear communication in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => navigate('/register')} icon={CalendarCheck}>Book a visit</PrimaryButton>
            <PrimaryButton onClick={() => navigate('/login')} variant="secondary" icon={PawPrint}>Sign in</PrimaryButton>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['Online appointment booking', 'Digital medical records', 'Experienced veterinarians'].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/65 px-3 py-2 text-sm font-bold text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="mx-auto grid max-w-7xl gap-4 px-5 py-12 md:grid-cols-3">
          {[
            { icon: CalendarCheck, title: 'Easy online booking', text: 'Choose a doctor, service, and time slot — we confirm your visit and send reminders.' },
            { icon: HeartPulse, title: 'Full medical history', text: 'Diagnoses, treatments, vaccinations, and visit notes stored securely in your pet profile.' },
            { icon: Users, title: 'A clinic that runs smoothly', text: 'Our team coordinates schedules, rooms, and daily flow so your visit is calm and on time.' },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <Surface key={feature.title} interactive className="p-6">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-[-0.03em]">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </Surface>
            );
          })}
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-5 py-12 pb-24">
          <Surface className="overflow-hidden p-6 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">Clinic workflow</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] md:text-5xl">From booking to medical record, every step feels connected.</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Client books visit', 'Admin assigns doctor + room', 'Doctor sees timeline', 'Record closes the appointment'].map((step, index) => (
                  <div key={step} className="rounded-[1.35rem] border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs font-black text-teal-600">0{index + 1}</p>
                    <p className="mt-2 font-black text-slate-950">{step}</p>
                    <p className="mt-1 text-sm text-slate-500">Simple, clear, and designed around real clinic visits.</p>
                  </div>
                ))}
              </div>
            </div>
          </Surface>
        </section>
      </main>
    </div>
  );
}

export function PremiumLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');

    const nextFieldErrors: Record<string, string> = {};
    const emailError = validateEmail(email);
    const passwordError = validateRequired(password, 'Password');
    if (emailError) nextFieldErrors.email = emailError;
    if (passwordError) nextFieldErrors.password = passwordError;
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setLoading(true);
    try {
      const role = await login(email.trim(), password);
      navigate(roleHomePath(role));
    } catch (error) {
      const apiFieldErrors = mapApiErrorsToFields(error);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors);
      }
      setFormError(formatApiError(error, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      title="Welcome back to VetVik"
      subtitle="Sign in with your account. Your dashboard opens automatically based on your role."
      sideTitle="Your pet's health records, visits, and clinic communication — all in one place."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field
          id="login-email"
          label="Email address"
          placeholder="name@example.com"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(value) => {
            setEmail(value);
            clearFieldError('email', setFieldErrors);
          }}
          error={fieldErrors.email}
        />
        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          required
          showPassword={showPassword}
          onToggleVisibility={() => setShowPassword(!showPassword)}
          value={password}
          onChange={(value) => {
            setPassword(value);
            clearFieldError('password', setFieldErrors);
          }}
          error={fieldErrors.password}
        />
        {formError && <FormError message={formError} />}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" className="accent-teal-600" /> Remember me</label>
          <button type="button" className="font-bold text-teal-700">Forgot password?</button>
        </div>
        <PrimaryButton type="submit" icon={ArrowRight} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </PrimaryButton>
        <p className="text-center text-xs text-slate-400">
          New client?{' '}
          <button type="button" onClick={() => navigate('/register')} className="font-bold text-teal-700">
            Create an account
          </button>
        </p>
      </form>
    </AuthFrame>
  );
}

export function PremiumRegisterPage() {
  const navigate = useNavigate();
  const { registerClient } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');

    const nextFieldErrors: Record<string, string> = {};
    const firstNameError = validateName(firstName, 'First name');
    const lastNameError = validateName(lastName, 'Last name');
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (firstNameError) nextFieldErrors.firstName = firstNameError;
    if (lastNameError) nextFieldErrors.lastName = lastNameError;
    if (emailError) nextFieldErrors.email = emailError;
    if (passwordError) nextFieldErrors.password = passwordError;
    if (!confirm) {
      nextFieldErrors.confirm = 'Please confirm your password.';
    } else if (password !== confirm) {
      nextFieldErrors.confirm = 'Passwords do not match.';
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setLoading(true);
    try {
      await registerClient({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      navigate('/client');
    } catch (error) {
      const apiFieldErrors = mapApiErrorsToFields(error);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...apiFieldErrors }));
      }
      setFormError(formatApiError(error, 'Could not create account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      title="Create your client account"
      subtitle="Registration is available for clinic clients only. Staff accounts are created by the clinic administrator."
      sideTitle="Join our clinic community and manage care for your pets online."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="register-first-name"
            label="First name"
            placeholder="Alex"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(value) => {
              setFirstName(value);
              clearFieldError('firstName', setFieldErrors);
            }}
            error={fieldErrors.firstName}
          />
          <Field
            id="register-last-name"
            label="Last name"
            placeholder="Morgan"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(value) => {
              setLastName(value);
              clearFieldError('lastName', setFieldErrors);
            }}
            error={fieldErrors.lastName}
          />
        </div>
        <Field
          id="register-email"
          label="Email address"
          placeholder="name@example.com"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(value) => {
            setEmail(value);
            clearFieldError('email', setFieldErrors);
          }}
          error={fieldErrors.email}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            id="register-password"
            label="Password"
            autoComplete="new-password"
            required
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)}
            value={password}
            onChange={(value) => {
              setPassword(value);
              clearFieldError('password', setFieldErrors);
            }}
            error={fieldErrors.password}
          />
          <Field
            id="register-confirm"
            label="Confirm password"
            placeholder="••••••••"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(value) => {
              setConfirm(value);
              clearFieldError('confirm', setFieldErrors);
            }}
            error={fieldErrors.confirm}
          />
        </div>
        <div className="rounded-2xl bg-teal-50 p-3 text-sm font-bold text-teal-800">
          Strong password: at least 8 characters, 1 uppercase letter, 1 number.
        </div>
        {formError && <FormError message={formError} />}
        <PrimaryButton type="submit" icon={ArrowRight} disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </PrimaryButton>
        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} className="font-bold text-teal-700">
            Sign in
          </button>
        </p>
      </form>
    </AuthFrame>
  );
}

function AuthFrame({ title, subtitle, sideTitle, children }: Readonly<{ title: string; subtitle: string; sideTitle: string; children: React.ReactNode }>) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f5f8f3] p-4 text-slate-950">
      <div className="grid min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] border border-white/80 bg-white/45 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:block">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-teal-400/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
          <button onClick={() => navigate('/')} className="relative z-10 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[1.35rem] bg-white text-slate-950">
              <PawPrint className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-[-0.05em]">VetVik</span>
          </button>
          <div className="relative z-10 mt-28">
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-teal-100">Veterinary clinic VetVik</p>
            <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.07em]">{sideTitle}</h2>
            <div className="mt-8 grid gap-3">
              {['Online booking', 'Medical records in one place', 'Direct clinic communication'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm font-bold text-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-teal-200" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>
        <main className="flex items-center justify-center p-5 lg:p-10">
          <div className="w-full max-w-xl">
            <button onClick={() => navigate('/')} className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-[1.25rem] bg-slate-950 text-white">
                <PawPrint className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-[-0.05em]">VetVik</span>
            </button>
            <Surface className="p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">Secure access</p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] md:text-4xl">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
              <div className="mt-7">{children}</div>
            </Surface>
          </div>
        </main>
      </div>
    </div>
  );
}

function clearFieldError(
  field: string,
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
) {
  setFieldErrors((prev) => {
    if (!prev[field]) return prev;
    const next = { ...prev };
    delete next[field];
    return next;
  });
}

function FormError({ message }: Readonly<{ message: string }>) {
  return <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{message}</p>;
}

function Field({
  id,
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  autoComplete,
}: Readonly<{
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}>) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm outline-none transition focus:bg-white focus:ring-4 focus:ring-teal-500/10 ${
          error
            ? 'border-rose-300 focus:border-rose-300'
            : 'border-slate-100 focus:border-teal-200'
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-bold text-rose-600">
          {error}
        </p>
      )}
    </label>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  error,
  required = false,
  autoComplete,
}: Readonly<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}>) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          required={required}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 pr-11 text-sm outline-none transition focus:bg-white focus:ring-4 focus:ring-teal-500/10 ${
            error
              ? 'border-rose-300 focus:border-rose-300'
              : 'border-slate-100 focus:border-teal-200'
          }`}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-bold text-rose-600">
          {error}
        </p>
      )}
    </label>
  );
}
