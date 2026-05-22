export const petSpeciesEmoji: Record<string, string> = {
  Dog: '🐕',
  Cat: '🐈',
  Rabbit: '🐇',
  Bird: '🦜',
  Fish: '🐠',
  Hamster: '🐹',
};

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function calcAge(birthDate: string | null | undefined): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return Math.max(age, 0);
}

export function mapAppointmentStatus(status: string): string {
  if (status === 'Confirmed') return 'Scheduled';
  return status;
}

export function mapPetHealthStatus(hasOverdueVaccines: boolean, hasRecentRecords: boolean): string {
  if (hasOverdueVaccines) return 'Needs Attention';
  if (hasRecentRecords) return 'Healthy';
  return 'Healthy';
}

export function doctorInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function doctorDisplayName(firstName: string, lastName: string): string {
  return `Dr. ${firstName} ${lastName}`;
}
