// =================================
//  IMPORTS
// =================================
import { useState } from "react";
import type { Section } from "../../../api/sections";
import type {
  ChecklistItem,
  Note,
  NotePayload,
  NoteReminderInput,
  NoteType,
} from "../../../api/notes";
import type { ReminderRecurrence } from "../../../api/reminders";
import { COLOR_PRESETS } from "../../../constants/colors";
import type { UserSummary } from "../../../api/users";
import { NoteSharePicker } from "./NoteSharePicker";
import { NoteIconPicker } from "./NoteIconPicker";
import { NoteImagesField } from "./NoteImagesField";
import { NoteTypeSelector } from "./NoteTypeSelector";
import { ChecklistEditor } from "./ChecklistEditor";
import { CodeSnippetEditor } from "./CodeSnippetEditor";
import { TableEditor } from "./TableEditor";
import { NoteRichTextEditor } from "./NoteRichTextEditor";
import GenericButton from "../GenericButton";
import { ColorPicker } from "../ColorPicker";
import { isContentEmpty } from "../../../utils/richText";

// =================================
//  TYPE
// =================================
export type NoteFormValues = {
  note: NotePayload;
  reminder: NoteReminderInput | null;
  newImages: File[];
  removedImageIds: number[];
};

// =================================
//  CONSTS
// =================================
const DEFAULT_COLOR = "#fde68a";

const RECURRENCE_OPTIONS: { value: ReminderRecurrence; label: string }[] = [
  { value: "none", label: "Non si ripete" },
  { value: "daily", label: "Ogni giorno" },
  { value: "weekly", label: "Ogni settimana" },
  { value: "monthly", label: "Ogni mese" },
  { value: "yearly", label: "Ogni anno" },
];

const FIELD_CLASS =
  "w-full rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light";

// =================================
//  FUNCTIONS
// =================================
// Converte una data ISO nel formato locale richiesto da <input type="datetime-local">
function toDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// =================================
//  COMPONENT
// =================================
export function NoteFormModal({
  note,
  sections,
  onSubmit,
  onClose,
}: {
  note?: Note;
  sections: Section[];
  onSubmit: (values: NoteFormValues) => void;
  onClose: () => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const isEditing = note !== undefined;
  const existingReminder = note?.reminders[0];

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [sectionIds, setSectionIds] = useState<number[]>(
    note?.sections.map((section) => section.id) ?? [],
  );
  const [color, setColor] = useState(note?.color ?? DEFAULT_COLOR);
  const [icon, setIcon] = useState<string | null>(note?.icon ?? null);
  const [noteType, setNoteType] = useState<NoteType>(note?.note_type ?? "plain");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    note?.note_type === "checklist" && note.block_data && "items" in note.block_data
      ? note.block_data.items
      : [],
  );
  const [codeSnippet, setCodeSnippet] = useState<{ language: string; code: string }>(
    note?.note_type === "code" && note.block_data && "code" in note.block_data
      ? { language: note.block_data.language, code: note.block_data.code }
      : { language: "", code: "" },
  );
  const [tableHeaders, setTableHeaders] = useState<string[]>(
    note?.note_type === "table" && note.block_data && "headers" in note.block_data
      ? note.block_data.headers
      : [],
  );
  const [tableRows, setTableRows] = useState<string[][]>(
    note?.note_type === "table" && note.block_data && "rows" in note.block_data
      ? note.block_data.rows
      : [],
  );
  const [isPinned, setIsPinned] = useState(Boolean(note?.is_pinned));
  const [hasReminder, setHasReminder] = useState(Boolean(existingReminder));
  const [remindAt, setRemindAt] = useState(
    existingReminder ? toDateTimeLocal(existingReminder.remind_at) : "",
  );
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>(
    existingReminder?.recurrence ?? "none",
  );
  const [reminderDone, setReminderDone] = useState(
    Boolean(existingReminder?.is_done),
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [isShared, setIsShared] = useState(Boolean(note?.is_shared));
  const [sharedWith, setSharedWith] = useState<UserSummary[]>(
    note?.shared_with_users ?? [],
  );

  // =================================
  //  FUNCTIONS
  // =================================
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isContentEmpty(content)) return;
    if (hasReminder && !remindAt) return;

    const recipients = isShared ? sharedWith.map((user) => user.id) : [];

    const blockData =
      noteType === "checklist"
        ? { items: checklistItems }
        : noteType === "code"
          ? codeSnippet
          : noteType === "table"
            ? { headers: tableHeaders, rows: tableRows }
            : null;

    onSubmit({
      note: {
        title: title.trim() || undefined,
        content,
        color,
        icon: icon ?? undefined,
        note_type: noteType,
        block_data: blockData,
        section_ids: sectionIds,
        is_shared: recipients.length > 0,
        shared_with: recipients,
        is_pinned: isPinned,
      },
      reminder: hasReminder
        ? {
            remind_at: new Date(remindAt).toISOString(),
            recurrence,
            is_done: reminderDone,
          }
        : null,
      newImages,
      removedImageIds,
    });
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-sm space-y-3 overflow-y-auto rounded-2xl border border-base-mid/25 bg-white p-4 dark:bg-base-dark md:max-w-3xl md:space-y-0 md:grid md:grid-cols-[minmax(0,1fr)_280px] md:items-start md:gap-x-8 md:gap-y-4 md:p-6 lg:max-w-5xl xl:max-w-6xl"
      >
        <h2 className="text-lg font-semibold text-base-dark dark:text-base-light md:col-span-2">
          {isEditing ? "Modifica nota" : "Nuova nota"}
        </h2>

        {/* Colonna principale: contenuto della nota */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Titolo (opzionale)"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={FIELD_CLASS}
          />

          <NoteRichTextEditor
            value={content}
            onChange={setContent}
            fieldClassName={FIELD_CLASS}
          />

          {/* Tipo di nota */}
          <div>
            <p className="mb-1 text-xs font-medium text-base-mid">Tipo</p>
            <NoteTypeSelector value={noteType} onChange={setNoteType} />
          </div>

          {noteType === "checklist" && (
            <ChecklistEditor
              items={checklistItems}
              onChange={setChecklistItems}
              fieldClassName={FIELD_CLASS}
            />
          )}

          {noteType === "code" && (
            <CodeSnippetEditor
              language={codeSnippet.language}
              code={codeSnippet.code}
              onChange={setCodeSnippet}
              fieldClassName={FIELD_CLASS}
            />
          )}

          {noteType === "table" && (
            <TableEditor
              headers={tableHeaders}
              rows={tableRows}
              onChange={(value) => {
                setTableHeaders(value.headers);
                setTableRows(value.rows);
              }}
              fieldClassName={FIELD_CLASS}
            />
          )}

          {/* Immagini */}
          <div>
            <p className="mb-1 text-xs font-medium text-base-mid">Immagini</p>
            <NoteImagesField
              existing={(note?.images ?? []).filter(
                (image) => !removedImageIds.includes(image.id),
              )}
              newFiles={newImages}
              onRemoveExisting={(id) =>
                setRemovedImageIds((prev) => [...prev, id])
              }
              onNewFilesChange={setNewImages}
            />
          </div>
        </div>

        {/* Colonna laterale: metadati e impostazioni */}
        <div className="space-y-3">
          {sections.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-base-mid">Sezioni</p>
              <div className="flex flex-wrap gap-1.5">
                {sections.map((section) => {
                  const isSelected = sectionIds.includes(section.id);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() =>
                        setSectionIds((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== section.id)
                            : [...prev, section.id],
                        )
                      }
                      className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium ${
                        isSelected
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-base-mid/25 text-base-mid hover:bg-base-mid/10"
                      }`}
                    >
                      {section.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Colore */}
          <div>
            <p className="mb-1 text-xs font-medium text-base-mid">Colore</p>
            <ColorPicker
              value={color}
              onChange={setColor}
              presets={[DEFAULT_COLOR, ...COLOR_PRESETS]}
            />
          </div>

          {/* Icona */}
          <div>
            <p className="mb-1 text-xs font-medium text-base-mid">Icona</p>
            <NoteIconPicker
              value={icon}
              onChange={setIcon}
              fieldClassName={FIELD_CLASS}
            />
          </div>

          {/* Pin */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-base-dark dark:text-base-light">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(event) => setIsPinned(event.target.checked)}
              className="accent-accent"
            />
            Fissa in alto
          </label>

          {/* Promemoria */}
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-base-dark dark:text-base-light">
              <input
                type="checkbox"
                checked={hasReminder}
                onChange={(event) => setHasReminder(event.target.checked)}
                className="accent-accent"
              />
              Aggiungi promemoria
            </label>

            {hasReminder && (
              <>
                <input
                  type="datetime-local"
                  value={remindAt}
                  onChange={(event) => setRemindAt(event.target.value)}
                  required
                  className={FIELD_CLASS}
                />
                <select
                  value={recurrence}
                  onChange={(event) =>
                    setRecurrence(event.target.value as ReminderRecurrence)
                  }
                  className={FIELD_CLASS}
                >
                  {RECURRENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {existingReminder && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-base-dark dark:text-base-light">
                    <input
                      type="checkbox"
                      checked={reminderDone}
                      onChange={(event) => setReminderDone(event.target.checked)}
                      className="accent-accent"
                    />
                    Fatto
                  </label>
                )}
              </>
            )}
          </div>

          {/* Condivisione */}
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-base-dark dark:text-base-light">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(event) => setIsShared(event.target.checked)}
                className="accent-accent"
              />
              Condividi con altri utenti
            </label>

            {isShared && (
              <NoteSharePicker
                selected={sharedWith}
                onChange={setSharedWith}
                fieldClassName={FIELD_CLASS}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1 md:col-span-2">
          <GenericButton type="button" variant="secondary" onClick={onClose}>
            Annulla
          </GenericButton>
          <GenericButton type="submit" variant="primary">
            {isEditing ? "Salva" : "Crea"}
          </GenericButton>
        </div>
      </form>
    </div>
  );
}
