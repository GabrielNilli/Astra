// =================================
//  IMPORTS
// =================================
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Share2,
  AlarmClock,
  Check,
  User as UserIcon,
  Bookmark,
  ListChecks,
  Code2,
  BarChart3,
  Copy,
} from "lucide-react";
import type { Note } from "../../../api/notes";
import type { Section } from "../../../api/sections";
import { useTapGestures } from "../../../hooks/useTapGestures";
import type { ReminderRecurrence } from "../../../api/reminders";
import { useAuth } from "../../../context/AuthContext";
import { resolveNoteIcon } from "../../../constants/noteIcons";
import { COLOR_PRESETS } from "../../../constants/colors";
import {
  isContentEmpty,
  looksLikeHtml,
  RICH_TEXT_CONTENT_CLASS,
  sanitizeNoteHtml,
  stripHtmlToText,
} from "../../../utils/richText";

// =================================
//  CONSTS
// =================================
const FALLBACK_COLOR = "#fde68a";

// In dark mode lo sfondo pagina usa lo stesso base-dark: senza schiarirlo la card sparisce nel bg
const CARD_SURFACE =
  "bg-white dark:bg-[color-mix(in_srgb,var(--color-base-dark),white_10%)]";

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
const TYPE_BADGES: Record<
  Exclude<Note["note_type"], "plain">,
  { label: string; icon: typeof ListChecks; color: string }
> = {
  checklist: { label: "Checklist", icon: ListChecks, color: "#10b981" },
  code: { label: "Snippet", icon: Code2, color: "#4f46e5" },
  stats: { label: "Statistiche", icon: BarChart3, color: "#d97706" },
};

const SHARED_BADGE = { label: "Condivisa", icon: Share2, color: "#33C7DC" };

const AVATAR_COLORS = [
  "#f97316",
  "#6366f1",
  "#0ea5e9",
  "#22c55e",
  "#ec4899",
  "#eab308",
];
const MAX_VISIBLE_AVATARS = 3;

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function NoteCard({
  note,
  sections,
  onDelete,
  onColorChange,
  onSectionsChange,
  onDuplicate,
  onEdit,
  onChecklistToggle,
  onPinToggle,
  onReminderToggle,
  selectionMode,
  isSelected,
  onToggleSelect,
  onLongPressSelect,
}: {
  note: Note;
  sections: Section[];
  onDelete: (id: number) => void;
  onColorChange: (id: number, color: string) => void;
  onSectionsChange: (id: number, sectionIds: number[]) => void;
  onDuplicate: (id: number) => void;
  onEdit: (note: Note) => void;
  onChecklistToggle: (id: number, itemIndex: number) => void;
  onPinToggle: (id: number, pinned: boolean) => void;
  onReminderToggle: (reminderId: number, done: boolean) => void;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onLongPressSelect: (id: number) => void;
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
  const badge =
    note.note_type !== "plain"
      ? TYPE_BADGES[note.note_type]
      : note.is_shared
        ? SHARED_BADGE
        : null;
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
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
    void navigator.clipboard.writeText(stripHtmlToText(note.content));
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
    if (selectionMode) return;
    closeMenu();
    onEdit(note);
  }

  const tapGestures = useTapGestures({
    onLongPress: () => onLongPressSelect(note.id),
    onDoubleTap: handleEdit,
  });

  // =================================
  //  USE EFFECTS
  // =================================
  // Il menu è renderizzato in un portal fuori dalla griglia (vedi RENDER): la
  // posizione va quindi calcolata a mano dal bottone che lo apre.
  useEffect(() => {
    if (!menuOpen || !menuButtonRef.current) {
      setMenuPosition(null);
      return;
    }

    const rect = menuButtonRef.current.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
  }, [menuOpen]);

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
      className={`rounded-2xl border border-t-4 border-black/5 shadow-sm transition-shadow select-none hover:shadow-md dark:border-white/15 ${
        isSelected ? "ring-2 ring-accent" : ""
      }`}
      style={{ borderTopColor: color }}
      onContextMenu={selectionMode ? undefined : openMenu}
      onDoubleClick={handleEdit}
      onClick={() => {
        if (selectionMode) onToggleSelect(note.id);
      }}
      {...tapGestures}
    >
      <div className={`relative rounded-t-2xl px-4 pt-3.5 pb-1 ${CARD_SURFACE}`}>
        <div className="flex min-h-5 items-center gap-2 pr-16">
          {badge ? (
            <div
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                backgroundColor: `${badge.color}1f`,
                color: badge.color,
              }}
            >
              <badge.icon size={12} />
              {badge.label}
            </div>
          ) : (
            <span />
          )}

          {note.sections.length > 0 && (
            <span
              title={note.sections.map((section) => section.name).join(", ")}
              className="min-w-0 flex-1 truncate text-right text-[11px] font-medium text-base-mid"
            >
              {note.sections.map((section) => `#${section.name}`).join(" ")}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          {Icon && <Icon size={18} className="shrink-0" style={{ color }} />}
          <h3 className="text-base font-semibold break-words text-base-dark dark:text-base-light">
            {note.title || "Senza titolo"}
          </h3>
        </div>

        {selectionMode ? (
          <div
            aria-hidden="true"
            className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
              isSelected
                ? "border-accent bg-accent text-white"
                : "border-base-mid/40 bg-white/80 dark:bg-base-dark/80"
            }`}
          >
            {isSelected && <Check size={14} />}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onPinToggle(note.id, !note.is_pinned)}
              aria-label={note.is_pinned ? "Rimuovi dai fissati" : "Fissa in alto"}
              className="absolute top-2 right-9 cursor-pointer rounded-full p-1 text-base-mid hover:bg-base-mid/10"
            >
              <Bookmark
                size={18}
                className={note.is_pinned ? "fill-base-mid" : ""}
              />
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => (menuOpen ? closeMenu() : openMenu())}
              className="absolute top-2 right-2 cursor-pointer rounded-full p-1 text-base-mid hover:bg-base-mid/10"
              aria-label="Azioni nota"
            >
              <MoreHorizontal size={18} />
            </button>
          </>
        )}

        {menuOpen &&
          menuPosition &&
          createPortal(
            <div
              ref={menuRef}
              onDoubleClick={(event) => event.stopPropagation()}
              style={{ top: menuPosition.top, right: menuPosition.right }}
              className={`fixed z-50 w-44 overflow-hidden rounded-lg border border-base-mid/25 text-sm shadow-lg ${CARD_SURFACE}`}
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
            </div>,
            document.body,
          )}
      </div>

      <div className={`rounded-b-2xl px-4 pt-1 pb-3.5 ${CARD_SURFACE}`}>
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
                className="block overflow-hidden rounded-lg shadow-md/50"
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

        {!isContentEmpty(note.content) &&
          (looksLikeHtml(note.content) ? (
            <div
              className={`text-sm text-base-dark dark:text-base-light ${RICH_TEXT_CONTENT_CLASS}`}
              dangerouslySetInnerHTML={{
                __html: sanitizeNoteHtml(note.content),
              }}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap text-base-dark dark:text-base-light">
              {note.content}
            </p>
          ))}

        {note.note_type === "checklist" &&
          note.block_data &&
          "items" in note.block_data && (
            <div className={!isContentEmpty(note.content) ? "mt-3" : ""}>
              {(() => {
                const items = note.block_data.items;
                const doneCount = items.filter((item) => item.done).length;
                return (
                  items.length > 0 && (
                    <>
                      <div className="mb-2 flex items-center justify-between text-xs font-medium text-base-dark dark:text-base-light">
                        <span>Checklist avanzamento</span>
                        <span>
                          {doneCount}/{items.length}
                        </span>
                      </div>
                      <div className="mb-2 h-2 overflow-hidden rounded-full bg-black/10">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${(doneCount / items.length) * 100}%`,
                          }}
                        />
                      </div>
                    </>
                  )
                );
              })()}
              <div className="space-y-1">
                {note.block_data.items.map((item, index) => (
                  <label
                    key={index}
                    className="flex cursor-pointer items-start gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => onChecklistToggle(note.id, index)}
                      className="mt-0.5 accent-accent"
                    />
                    <span
                      className={`text-base-dark dark:text-base-light ${item.done ? "line-through opacity-60" : ""}`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

        {note.note_type === "code" &&
          note.block_data &&
          "code" in note.block_data && (
            <div className={!isContentEmpty(note.content) ? "mt-3" : ""}>
              <div className="overflow-hidden rounded-lg bg-slate-900">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[11px] font-medium text-slate-400">
                    {note.block_data.language || "Codice"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      void navigator.clipboard.writeText(
                        (note.block_data as { code: string }).code,
                      )
                    }
                    aria-label="Copia codice"
                    className="flex cursor-pointer items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    <Copy size={12} />
                    Copia
                  </button>
                </div>
                <pre className="px-3 pb-3 text-xs">
                  <code className="whitespace-pre-wrap break-words text-slate-100">
                    {note.block_data.code}
                  </code>
                </pre>
              </div>
            </div>
          )}

        {note.note_type === "stats" &&
          note.block_data &&
          "rows" in note.block_data && (
            <div
              className={`grid grid-cols-2 gap-1.5 ${!isContentEmpty(note.content) ? "mt-3" : ""}`}
            >
              {note.block_data.rows.map((row, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-black/5 px-2.5 py-1.5 dark:bg-white/5"
                >
                  <p className="text-[11px] text-base-mid">{row.label}</p>
                  <p className="text-sm font-semibold text-base-dark dark:text-base-light">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          )}

        <div className="mt-3 space-y-1.5 border-t border-black/10 pt-2 text-xs text-base-mid dark:border-white/10">
          {!isOwnNote && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1">
                <UserIcon size={12} />
                Di {note.author.name}
              </span>
            </div>
          )}

          {note.is_shared && note.shared_with_users.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {note.shared_with_users
                  .slice(0, MAX_VISIBLE_AVATARS)
                  .map((sharedUser) => (
                    <div
                      key={sharedUser.id}
                      title={sharedUser.name}
                      className="h-5 w-5 shrink-0 overflow-hidden rounded-full border-2 border-white dark:border-base-dark"
                    >
                      {sharedUser.profile_pic ? (
                        <img
                          src={sharedUser.profile_pic}
                          alt={sharedUser.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-white"
                          style={{
                            backgroundColor: avatarColor(sharedUser.id),
                          }}
                        >
                          {initials(sharedUser.name)}
                        </div>
                      )}
                    </div>
                  ))}
                {note.shared_with_users.length > MAX_VISIBLE_AVATARS && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white bg-base-mid/30 text-[9px] font-semibold text-base-dark dark:border-base-dark dark:text-base-light">
                    +{note.shared_with_users.length - MAX_VISIBLE_AVATARS}
                  </div>
                )}
              </div>
              <span className="flex items-center gap-1">
                <Share2 size={12} className="shrink-0" />
                Condivisa con{" "}
                {note.shared_with_users.map((shared) => shared.name).join(", ")}
              </span>
            </div>
          )}

          {note.reminders.map((reminder) => (
            <label
              key={reminder.id}
              className={`flex cursor-pointer items-center gap-1.5 ${reminder.is_done ? "line-through opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                checked={reminder.is_done}
                onChange={(event) =>
                  onReminderToggle(reminder.id, event.target.checked)
                }
                className="accent-accent"
              />
              <AlarmClock size={12} className="shrink-0" />
              <span>
                {formatDate(reminder.remind_at)}
                {reminder.recurrence !== "none" &&
                  ` · ${RECURRENCE_LABELS[reminder.recurrence]}`}
              </span>
            </label>
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
