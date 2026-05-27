import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { PrimaryButton, cn } from './VetVikUI';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export function FormDialog({
  open,
  title,
  description,
  onClose,
  children,
  widthClassName = 'max-w-3xl',
}: Readonly<{
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
}>) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const dialog = (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'my-10 w-full rounded-[2rem] border border-slate-700 bg-slate-900 shadow-2xl',
          widthClassName,
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-white">{title}</h2>
            {description ? <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-2xl border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

export function FormGrid({
  children,
  columns = 1,
}: Readonly<{
  children: ReactNode;
  columns?: 1 | 2;
}>) {
  return (
    <div className={cn('grid gap-4', columns === 2 && 'md:grid-cols-2')}>
      {children}
    </div>
  );
}

export function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required = false,
  min,
  step,
  disabled = false,
}: Readonly<{
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'date' | 'datetime-local' | 'number';
  placeholder?: string;
  error?: string;
  required?: boolean;
  min?: string | number;
  step?: string | number;
  disabled?: boolean;
}>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-200">
        {label}
        {required ? <span className="text-rose-400"> *</span> : null}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        min={min}
        step={step}
        disabled={disabled}
        className={cn(
          'h-12 w-full rounded-2xl border bg-slate-950 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-4 focus:ring-teal-500/10',
          error ? 'border-rose-400/70 focus:border-rose-400' : 'border-slate-700 focus:border-teal-400/60',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      />
      {error ? <p className="mt-1.5 text-xs font-bold text-rose-400">{error}</p> : null}
    </label>
  );
}

export function FormTextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  disabled = false,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  disabled?: boolean;
}>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-200">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full resize-none rounded-2xl border bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-4 focus:ring-teal-500/10',
          error ? 'border-rose-400/70 focus:border-rose-400' : 'border-slate-700 focus:border-teal-400/60',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      />
      {error ? <p className="mt-1.5 text-xs font-bold text-rose-400">{error}</p> : null}
    </label>
  );
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-200">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'h-12 w-full appearance-none rounded-2xl border bg-slate-950 px-4 pr-11 text-sm text-slate-100 outline-none transition focus:ring-4 focus:ring-teal-500/10',
            error ? 'border-rose-400/70 focus:border-rose-400' : 'border-slate-700 focus:border-teal-400/60',
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {error ? <p className="mt-1.5 text-xs font-bold text-rose-400">{error}</p> : null}
    </label>
  );
}

export function FormCheckboxList({
  label,
  options,
  selectedValues,
  onToggle,
}: Readonly<{
  label: string;
  options: SelectOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}>) {
  return (
    <div className="block">
      <span className="mb-2 block text-sm font-bold text-slate-200">{label}</span>
      <div className="grid gap-2 rounded-[1.5rem] border border-slate-700 bg-slate-950 p-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-center gap-3 rounded-2xl border border-slate-800 px-3 py-2 text-sm text-slate-200',
              option.disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => onToggle(option.value)}
              disabled={option.disabled}
              className="h-4 w-4 accent-teal-500"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function FormSwitchRow({
  label,
  checked,
  onChange,
  description,
}: Readonly<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}>) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-slate-700 bg-slate-950 px-4 py-3">
      <div>
        <p className="font-bold text-slate-100">{label}</p>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-teal-500"
      />
    </label>
  );
}

export function FormErrorMessage({ message }: Readonly<{ message?: string | null }>) {
  if (!message) return null;
  return <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-300">{message}</p>;
}

export function FormActions({
  onCancel,
  submitLabel,
  submittingLabel,
  loading = false,
}: Readonly<{
  onCancel: () => void;
  submitLabel: string;
  submittingLabel: string;
  loading?: boolean;
}>) {
  return (
    <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-5">
      <PrimaryButton variant="ghost" onClick={onCancel} disabled={loading}>
        Cancel
      </PrimaryButton>
      <PrimaryButton type="submit" disabled={loading}>
        {loading ? submittingLabel : submitLabel}
      </PrimaryButton>
    </div>
  );
}
