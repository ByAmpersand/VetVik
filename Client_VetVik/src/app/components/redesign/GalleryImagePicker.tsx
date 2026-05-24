import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { readGalleryImageFile } from '../../utils/galleryImage';

type GalleryImagePickerProps = {
  onSelect: (dataUrl: string) => void;
  onError?: (message: string) => void;
  accept?: string;
  children: (open: () => void) => ReactNode;
};

export function GalleryImagePicker({
  onSelect,
  onError,
  accept = 'image/*',
  children,
}: Readonly<GalleryImagePickerProps>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => {
    inputRef.current?.click();
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readGalleryImageFile(file);
      onSelect(dataUrl);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Could not load the selected image.');
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      {children(open)}
    </>
  );
}
