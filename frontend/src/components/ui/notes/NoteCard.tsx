// =================================
//  IMPORTS
// =================================
import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Share2,
  AlarmClock,
  type LucideIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { Note } from "../../../api/notes";
import { useTapGestures } from "../../../hooks/useTapGestures";
import { COLOR_PRESETS } from "../../../constants/colors";

// =================================
//  CONSTS
// =================================
const FALLBACK_COLOR = "#fde68a";

// =================================
//  FUNCTIONS
// =================================
function iconNameToComponentName(value: string): string {
  return value
    .trim()
    .replace(/[-_\s]+(.)?/g, (_, char: string | undefined) =>
      char ? char.toUpperCase() : "",
    )
    .replace(/^./, (char) => char.toUpperCase());
}

function resolveNoteIcon(name: string | null): LucideIcon | null {
  if (!name) return null;
  const componentName = iconNameToComponentName(name);
  const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[
    componentName
  ];
  return icon ?? null;
}

// =================================
//  COMPONENT
// =================================
export function NoteCard({
  note,
  onDelete,
  onColorChange,
}: {
  note: Note;
  onDelete: (id: number) => void;
  onColorChange: (id: number, color: string) => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const color = note.color ?? FALLBACK_COLOR;
  const Icon = resolveNoteIcon(note.icon);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
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
  }

  function handleCopy() {
    void navigator.clipboard.writeText(note.content);
    closeMenu();
  }

  function handleDuplicate() {
    console.log("TODO: duplica nota", note.id);
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
    console.log("TODO: modifica nota", note.id);
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
        <p className="text-sm whitespace-pre-wrap text-base-dark dark:text-base-light">
          {note.content}
        </p>

        <div className="mt-3 flex items-center justify-center gap-3 border-t border-black/10 pt-2 text-xs text-base-mid">
          <span>
            {new Date(note.updated_at).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {note.is_shared && <Share2 size={12} />}
          {note.has_reminder && <AlarmClock size={12} />}
        </div>
      </div>
    </div>
  );
}
