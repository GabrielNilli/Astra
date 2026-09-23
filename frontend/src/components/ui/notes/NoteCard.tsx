// =================================
//  IMPORTS
// =================================
import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Share2,
  AlarmClock,
  Folder,
  Check,
  User as UserIcon,
} from "lucide-react";
import type { Note } from "../../../api/notes";
import type { Section } from "../../../api/sections";
import { useTapGestures } from "../../../hooks/useTapGestures";
import type { ReminderRecurrence } from "../../../api/reminders";
import { useAuth } from "../../../context/AuthContext";
import { resolveNoteIcon } from "../../../constants/noteIcons";
import { COLOR_PRESETS } from "../../../constants/colors";

// =================================
//  CONSTS
// =================================
const FALLBACK_COLOR = "#fde68a";

const RECURRENCE_LABELS: Record<ReminderRecurrence, string> = {
  none: "",
  daily: "ogni giorno",
  weekly: "ogni settimana",
  monthly: "ogni mese",
  yearly: "ogni anno",
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

// =================================
//  COMPONENT
// =================================
export function NoteCard({
  note,
  sections,
  onDelete,
  onColorChange,
  onSectionsChange,
  onDuplicate,
  onEdit,
}: {
  note: Note;
  sections: Section[];
  onDelete: (id: number) => void;
  onColorChange: (id: number, color: string) => void;
  onSectionsChange: (id: number, sectionIds: number[]) => void;
  onDuplicate: (id: number) => void;
  onEdit: (note: Note) => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const { user } = useAuth();
  const color = note.color ?? FALLBACK_COLOR;
  const isOwnNote = note.created_by === user?.id;
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("it-IT", DATE_FORMAT);
  const Icon = resolveNoteIcon(note.icon);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [draftSectionIds, setDraftSectionIds] = useState<number[]>([]);
  const [draftColor, setDraftColor] = useState(color);

  // =================================
  //  FUNCTIONS
  // =================================
  function openMenu(event?: React.SyntheticEvent) {
    event?.preventDefault();
    setMenuOpen(true);
  }

  function closeMenu() {
    setMenuOpen(false);
    setShowColorPicker(false);
    setShowSectionPicker(false);
  }

  function handleSectionPickerToggle() {
    if (!showSectionPicker) {
      setDraftSectionIds(note.sections.map((section) => section.id));
    }
    setShowSectionPicker((value) => !value);
  }

  function handleSectionToggle(sectionId: number) {
    setDraftSectionIds((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId],
    );
  }

  function handleSectionsConfirm() {
    onSectionsChange(note.id, draftSectionIds);
    closeMenu();
  }

  function handleCopy() {
    void navigator.clipboard.writeText(note.content);
    closeMenu();
  }

  function handleDuplicate() {
    onDuplicate(note.id);
    closeMenu();
  }

  function handleDelete() {
    onDelete(note.id);
    closeMenu();
  }

  function handleColorPick(newColor: string) {
    onColorChange(note.id, newColor);
    closeMenu();
  }

  function handleEdit() {
    closeMenu();
    onEdit(note);
  }

  const tapGestures = useTapGestures({
    onLongPress: () => openMenu(),
    onDoubleTap: handleEdit,
  });

  // =================================
  //  USE EFFECTS
  // =================================
  useEffect(() => {
    if (!menuOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  // =================================
  //  RENDER
  // =================================
  return (
    <div
      className="rounded-2xl border border-base-mid/25 select-none"
      onContextMenu={openMenu}
      onDoubleClick={handleEdit}
      {...tapGestures}
    >
      <div
        className="relative rounded-t-2xl px-4 py-3"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center gap-2 pr-8">
          {Icon && <Icon size={18} className="shrink-0 text-slate-900" />}
          <h3 className="text-lg font-semibold break-words text-slate-900">
            {note.title || "Senza titolo"}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => (menuOpen ? closeMenu() : openMenu())}
          className="absolute top-2 right-2 cursor-pointer rounded-full p-1 text-slate-900/60 hover:bg-black/10"
          aria-label="Azioni nota"
        >
          <MoreHorizontal size={18} />
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            onDoubleClick={(event) => event.stopPropagation()}
            className="absolute top-9 right-2 z-10 w-44 overflow-hidden rounded-lg border border-base-mid/25 bg-white text-sm shadow-lg dark:bg-base-dark"
          >
            <button
              type="button"
              onClick={handleCopy}
              className="block w-full cursor-pointer px-3 py-2 text-left text-base-dark hover:bg-base-mid/10 dark:text-base-light"
            >
              Copia testo
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              className="block w-full cursor-pointer px-3 py-2 text-left text-base-dark hover:bg-base-mid/10 dark:text-base-light"
            >
              Duplica
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftColor(color);
                setShowColorPicker((value) => !value);
              }}
              className="block w-full cursor-pointer px-3 py-2 text-left text-base-dark hover:bg-base-mid/10 dark:text-base-light"
            >
              Cambia colore
            </button>

            {showColorPicker && (
              <div className="flex flex-wrap items-center gap-2 border-t border-base-mid/25 px-3 py-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleColorPick(preset)}
                    aria-label={`Usa ${preset} come colore`}
                    className="h-6 w-6 cursor-pointer rounded-full border-2 border-transparent hover:scale-105"
                    style={{ backgroundColor: preset }}
                  />
                ))}
                <label
                  title="Colore personalizzato"
                  className="relative flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-base-mid/40 text-xs leading-none text-base-mid"
                >
                  +
                  <input
                    type="color"
                    value={draftColor}
                    onChange={(event) => setDraftColor(event.target.value)}
                    onBlur={() => {
                      if (draftColor !== color) handleColorPick(draftColor);
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>
              </div>
            )}

            <button
              type="button"
              onClick={handleSectionPickerToggle}
              className="block w-full cursor-pointer px-3 py-2 text-left text-base-dark hover:bg-base-mid/10 dark:text-base-light"
            >
              Aggiungi a
            </button>

            {showSectionPicker && (
              <div className="max-h-40 overflow-y-auto border-t border-base-mid/25 py-1">
                {sections.length === 0 && (
                  <p className="px-3 py-2 text-xs text-base-mid">
                    Nessuna sezione disponibile
                  </p>
                )}
                {sections.map((section) => (
                  <label
                    key={section.id}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-base-dark hover:bg-base-mid/10 dark:text-base-light"
                  >
                    <input
                      type="checkbox"
                      checked={draftSectionIds.includes(section.id)}
                      onChange={() => handleSectionToggle(section.id)}
                      className="accent-accent"
                    />
                    {section.name}
                  </label>
                ))}
                {sections.length > 0 && (
                  <div className="px-3 pt-1 pb-1">
                    <button
                      type="button"
                      onClick={handleSectionsConfirm}
                      aria-label="Conferma sezioni"
                      className="flex w-full cursor-pointer items-center justify-center rounded-md bg-accent py-1.5 text-white hover:brightness-90"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleDelete}
              className="block w-full cursor-pointer border-t border-base-mid/25 px-3 py-2 text-left text-red-600 hover:bg-red-600/10"
            >
              Elimina
            </button>
          </div>
        )}
      </div>

      <div
        className="rounded-b-2xl px-4 py-3"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)`,
        }}
      >
        {note.images.length > 0 && (
          <div
            className={`mb-3 grid gap-1.5 ${note.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          >
            {note.images.map((image) => (
              <a
                key={image.id}
                href={image.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg"
              >
                <img
                  src={image.url}
                  alt=""
                  loading="lazy"
                  className={`w-full object-cover ${note.images.length === 1 ? "max-h-80" : "aspect-square"}`}
                />
              </a>
            ))}
          </div>
        )}

        <p className="text-sm whitespace-pre-wrap text-base-dark dark:text-base-light">
          {note.content}
        </p>

        <div className="mt-3 space-y-1.5 border-t border-black/10 pt-2 text-xs text-base-mid">
          {(note.sections.length > 0 || !isOwnNote) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {note.sections.length > 0 && (
                <span className="flex items-center gap-1">
                  <Folder size={12} />
                  {note.sections.map((section) => section.name).join(", ")}
                </span>
              )}
              {!isOwnNote && (
                <span className="flex items-center gap-1">
                  <UserIcon size={12} />
                  Di {note.author.name}
                </span>
              )}
            </div>
          )}

          {note.is_shared && note.shared_with_users.length > 0 && (
            <div className="flex items-start gap-1">
              <Share2 size={12} className="mt-0.5 shrink-0" />
              <span>
                Condivisa con{" "}
                {note.shared_with_users.map((shared) => shared.name).join(", ")}
              </span>
            </div>
          )}

          {note.reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`flex items-center gap-1 ${reminder.is_done ? "line-through opacity-60" : ""}`}
            >
              <AlarmClock size={12} className="shrink-0" />
              <span>
                {formatDate(reminder.remind_at)}
                {reminder.recurrence !== "none" &&
                  ` · ${RECURRENCE_LABELS[reminder.recurrence]}`}
              </span>
            </div>
          ))}

          <div className="flex flex-wrap justify-between gap-x-3">
            <span>Creata {formatDate(note.created_at)}</span>
            {note.updated_at !== note.created_at && (
              <span>Modificata {formatDate(note.updated_at)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
