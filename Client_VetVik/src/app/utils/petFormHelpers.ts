export const OTHER_BREED_VALUE = '__other__';

export const CUSTOM_BREED_PREFIX = 'Breed: ';

export function parseCustomBreedFromNotes(notes?: string | null): {
  customBreed: string;
  careNotes: string;
} {
  if (!notes?.trim()) return { customBreed: '', careNotes: '' };

  const lines = notes.split('\n');
  if (lines[0]?.startsWith(CUSTOM_BREED_PREFIX)) {
    return {
      customBreed: lines[0].slice(CUSTOM_BREED_PREFIX.length).trim(),
      careNotes: lines.slice(1).join('\n').trim(),
    };
  }

  return { customBreed: '', careNotes: notes.trim() };
}

export function buildPetNotes(customBreed: string, careNotes: string): string | null {
  const trimmedCustom = customBreed.trim();
  const trimmedCare = careNotes.trim();

  if (trimmedCustom && trimmedCare) {
    return `${CUSTOM_BREED_PREFIX}${trimmedCustom}\n${trimmedCare}`;
  }
  if (trimmedCustom) return `${CUSTOM_BREED_PREFIX}${trimmedCustom}`;
  if (trimmedCare) return trimmedCare;
  return null;
}

export function resolvePetBreedName(breedName?: string | null, notes?: string | null): string {
  if (breedName?.trim()) return breedName.trim();
  const { customBreed } = parseCustomBreedFromNotes(notes);
  if (customBreed) return customBreed;
  return 'Mixed';
}
