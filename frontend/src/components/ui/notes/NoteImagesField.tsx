// =================================
//  IMPORTS
// =================================
import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { NoteImage } from "../../../api/notes";

// =================================
//  CONSTS
// =================================
export const MAX_NOTE_IMAGES = 10;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// =================================
//  COMPONENT
// =================================
export function NoteImagesField({
  existing,
  newFiles,
  onRemoveExisting,
  onNewFilesChange,
}: {
  existing: NoteImage[];
  newFiles: File[];
  onRemoveExisting: (id: number) => void;
  onNewFilesChange: (files: File[]) => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(
    () => newFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newFiles],
  );
  const total = existing.length + newFiles.length;

  // =================================
  //  FUNCTIONS
  // =================================
  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";

    const valid = picked.filter(
      (file) =>
        ACCEPTED_TYPES.includes(file.type) && file.size <= MAX_IMAGE_BYTES,
    );
    const room = MAX_NOTE_IMAGES - total;

    if (valid.length < picked.length) {
      setError("Sono ammesse solo immagini JPG, PNG, WebP o GIF fino a 4 MB.");
    } else if (valid.length > room) {
      setError(
        `Una nota può contenere al massimo ${MAX_NOTE_IMAGES} immagini.`,
      );
    } else {
      setError(null);
    }

    if (valid.length > 0) {
      onNewFilesChange([...newFiles, ...valid.slice(0, room)]);
    }
  }

  // =================================
  //  USE EFFECTS
  // =================================
  useEffect(() => {
    return () =>
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {existing.map((image) => (
          <Thumbnail
            key={`existing-${image.id}`}
            src={image.url}
            onRemove={() => onRemoveExisting(image.id)}
          />
        ))}
        {previews.map(({ file, url }) => (
          <Thumbnail
            key={`new-${file.name}-${file.lastModified}-${file.size}`}
            src={url}
            onRemove={() =>
              onNewFilesChange(newFiles.filter((other) => other !== file))
            }
          />
        ))}

        {total < MAX_NOTE_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Aggiungi immagini"
            className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-base-mid/40 text-base-mid hover:bg-base-mid/10"
          >
            <ImagePlus size={20} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        onChange={handlePick}
        className="hidden"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// =================================
//  SUBCOMPONENTS
// =================================
function Thumbnail({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="relative h-16 w-16">
      <img
        src={src}
        alt=""
        className="h-full w-full rounded-md border border-base-mid/25 object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Rimuovi immagine"
        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-base-dark text-white shadow"
      >
        <X size={12} />
      </button>
    </div>
  );
}
