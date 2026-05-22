import { ApiError } from '../../api/http';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[\p{L}\s'-]+$/u;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isStrongPassword(value: string): boolean {
  return value.length >= 8 && /[A-Z]/.test(value) && /\d/.test(value);
}

export function validateRequired(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} is required.`;
  return undefined;
}

export function validateName(value: string, label: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < 2) return `${label} must be at least 2 characters.`;
  if (!NAME_PATTERN.test(trimmed)) return `${label} may contain letters, spaces, hyphens, and apostrophes only.`;
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Email address is required.';
  if (!isValidEmail(trimmed)) return 'Enter a valid email address.';
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(value)) return 'Password must include at least one uppercase letter.';
  if (!/\d/.test(value)) return 'Password must include at least one number.';
  return undefined;
}

const API_FIELD_LABELS: Record<string, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email address',
  password: 'Password',
  address: 'Address',
  ownerId: 'Owner',
  speciesId: 'Species',
  breedId: 'Breed',
  name: 'Pet name',
  birthDate: 'Birth date',
  weight: 'Weight',
  notes: 'Care notes',
  sex: 'Sex',
};

function normalizeApiFieldKey(key: string): string {
  return key.charAt(0).toLowerCase() + key.slice(1);
}

export function formatApiError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const messages: string[] = [];

  if (error.payload?.errors) {
    for (const [field, fieldMessages] of Object.entries(error.payload.errors)) {
      const label = API_FIELD_LABELS[normalizeApiFieldKey(field)] ?? field;
      for (const message of fieldMessages) {
        messages.push(`${label}: ${message}`);
      }
    }
  }

  if (messages.length > 0) return messages.join(' ');

  if (error.payload?.detail) return error.payload.detail;
  if (error.payload?.title && error.payload.title !== 'One or more validation errors occurred.') {
    return error.payload.title;
  }
  if (error.message && !error.message.startsWith('HTTP ')) return error.message;

  if (error.status === 409) return 'An account with this email already exists.';
  if (error.status === 400) return 'Please check the form and try again.';
  if (error.status === 401) return 'Invalid email or password.';
  if (error.status >= 500) return 'Server error. Please try again in a moment.';

  return fallback;
}

export function mapApiErrorsToFields(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.payload?.errors) return {};

  const fieldErrors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(error.payload.errors)) {
    const key = normalizeApiFieldKey(field);
    if (messages[0]) fieldErrors[key] = messages[0];
  }
  return fieldErrors;
}
