const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateGalleryImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please choose an image file from your gallery.';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be smaller than 5 MB.';
  }
  return null;
}

export function readGalleryImageFile(file: File): Promise<string> {
  const validationError = validateGalleryImageFile(file);
  if (validationError) {
    return Promise.reject(new Error(validationError));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Could not read the selected image.'));
    };
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}
