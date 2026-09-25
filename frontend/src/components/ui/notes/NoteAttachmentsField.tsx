// =================================
//  IMPORTS
// =================================
import { useRef, useState } from "react";
import { File as FileIcon, Paperclip, X } from "lucide-react";
import type { NoteAttachment } from "../../../api/notes";

// =================================
//  CONSTS
// =================================
export const MAX_NOTE_ATTACHMENTS = 10;
const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;
const BLOCKED_EXTENSIONS = ["exe", "sh", "bat", "cmd", "msi", "com", "scr"];

// =================================
//  COMPONENT
// =================================
export function NoteAttachmentsField({
  existing,
  newFiles,
  onRemoveExisting,
  onNewFilesChange,
}: {
  existing: NoteAttachment[];
  newFiles: File[];
  onRemoveExisting: (id: number) => void;
  onNewFilesChange: (files: File[]) => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const total = existing.length + newFiles.length;

  // =================================
  //  FUNCTIONS
  // =================================
  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";

    const valid = picked.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      return file.size <= MAX_ATTACHMENT_BYTES && !BLOCKED_EXTENSIONS.includes(extension);
    });
    const room = MAX_NOTE_ATTACHMENTS - total;

    if (valid.length < picked.length) {
      setError("Alcuni file superano i 15 MB o hanno un tipo non consentito.");
    } else if (valid.length > room) {
      setError(`Una nota può contenere al massimo ${MAX_NOTE_ATTACHMENTS} allegati.`);
    } else {
      setError(null);
    }

    if (valid.length > 0) {
      onNewFilesChange([...newFiles, ...valid.slice(0, room)]);
    }
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        {existing.map((attachment) => (
          <AttachmentRow
            key={`existing-${attachment.id}`}
            filename={attachment.filename}
            size={attachment.size}
            onRemove={() => onRemoveExisting(attachment.id)}
          />
        ))}
        {newFiles.map((file) => (
          <AttachmentRow
            key={`new-${file.name}-${file.lastModified}-${file.size}`}
            filename={file.name}
            size={file.size}
            onRemove={() => onNewFilesChange(newFiles.filter((other) => other !== file))}
          />
        ))}
      </div>

      {total < MAX_NOTE_ATTACHMENTS && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          <Paperclip size={14} />
          Aggiungi allegato
        </button>
      )}

      <input ref={inputRef} type="file" multiple onChange={handlePick} className="hidden" />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// =================================
//  SUBCOMPONENTS
// =================================
function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentRow({
  filename,
  size,
  onRemove,
}: {
  filename: string;
  size: number;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-base-mid/25 px-2 py-1.5 text-xs">
      <FileIcon size={14} className="shrink-0 text-base-mid" />
      <span className="min-w-0 flex-1 truncate text-base-dark dark:text-base-light">{filename}</span>
      <span className="shrink-0 text-base-mid">{formatSize(size)}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Rimuovi allegato"
        className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-mid hover:bg-base-mid/10"
      >
        <X size={12} />
      </button>
    </div>
  );
}
