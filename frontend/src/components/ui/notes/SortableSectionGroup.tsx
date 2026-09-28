// =================================
//  IMPORTS
// =================================
import { Check, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Note } from "../../../api/notes";
import type { Section } from "../../../api/sections";
import { NoteCard } from "./NoteCard";
import type { NoteViewMode } from "./NoteActionsBar";

// =================================
//  COMPONENT
// =================================
export function SortableSectionGroup({
  section,
  notes,
  showHeader,
  viewMode,
  sections,
  onDelete,
  onColorChange,
  onSectionsChange,
  onDuplicate,
  onEdit,
  onChecklistToggle,
  onPinToggle,
  onArchiveToggle,
  onFavoriteToggle,
  onReminderToggle,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectSection,
  onLongPressSelect,
  isCollapsed,
  onToggleCollapse,
}: {
  section: Section | null;
  notes: Note[];
  showHeader: boolean;
  viewMode: NoteViewMode;
  sections: Section[];
  onDelete: (id: number) => void;
  onColorChange: (id: number, color: string) => void;
  onSectionsChange: (id: number, sectionIds: number[]) => void;
  onDuplicate: (id: number) => void;
  onEdit: (note: Note) => void;
  onChecklistToggle: (id: number, itemIndex: number) => void;
  onPinToggle: (id: number, pinned: boolean) => void;
  onArchiveToggle: (id: number, archived: boolean) => void;
  onFavoriteToggle: (id: number, favorite: boolean) => void;
  onReminderToggle: (reminderId: number, done: boolean) => void;
  selectionMode: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectSection: (ids: number[]) => void;
  onLongPressSelect: (id: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: section?.id ?? "none", disabled: section === null });

  const allSelected = notes.length > 0 && notes.every((note) => selectedIds.has(note.id));

  // Le note con tabella vengono renderizzate a parte (fuori dalla griglia a
  // colonne), che altrimenti forzerebbe anche loro alla larghezza fissa della
  // colonna costringendo la tabella a scrollare.
  const tableNotes = notes.filter((note) => note.note_type === "table");
  const otherNotes = notes.filter((note) => note.note_type !== "table");

  // =================================
  //  FUNCTIONS
  // =================================
  // Le note con tabella escono dalla griglia a colonne (che forza tutte le
  // card alla stessa larghezza): così possono allargarsi fino alla larghezza
  // naturale della tabella invece di scrollare dentro una colonna stretta.
  function renderCard(note: Note) {
    return (
      <NoteCard
        note={note}
        sections={sections}
        onDelete={onDelete}
        onColorChange={onColorChange}
        onSectionsChange={onSectionsChange}
        onDuplicate={onDuplicate}
        onEdit={onEdit}
        onChecklistToggle={onChecklistToggle}
        onPinToggle={onPinToggle}
        onArchiveToggle={onArchiveToggle}
        onFavoriteToggle={onFavoriteToggle}
        onReminderToggle={onReminderToggle}
        selectionMode={selectionMode}
        isSelected={selectedIds.has(note.id)}
        onToggleSelect={onToggleSelect}
        onLongPressSelect={onLongPressSelect}
      />
    );
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <section
      ref={section ? setNodeRef : undefined}
      style={
        section
          ? { transform: CSS.Transform.toString(transform), transition }
          : undefined
      }
      className={`mb-6 last:mb-0 ${section && isDragging ? "opacity-50" : ""}`}
    >
      {showHeader && (
        <div className="mb-2 flex items-center gap-2">
          {section && !selectionMode && (
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label="Trascina per riordinare la sezione"
              className="flex shrink-0 cursor-grab touch-none items-center text-base-mid hover:text-base-dark active:cursor-grabbing dark:hover:text-base-light"
            >
              <GripVertical size={14} />
            </button>
          )}

          {selectionMode && (
            <button
              type="button"
              onClick={() => onToggleSelectSection(notes.map((note) => note.id))}
              aria-label={allSelected ? "Deseleziona sezione" : "Seleziona sezione"}
              className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 ${
                allSelected
                  ? "border-accent bg-accent text-white"
                  : "border-base-mid/40 text-transparent"
              }`}
            >
              <Check size={12} />
            </button>
          )}

          <h2
            onClick={!selectionMode ? onToggleCollapse : undefined}
            className={`shrink-0 text-sm font-semibold text-base-dark dark:text-base-light ${!selectionMode ? "cursor-pointer" : ""}`}
          >
            {section?.name ?? "Senza sezione"}
          </h2>
          <span className="shrink-0 text-xs text-base-mid">{notes.length}</span>
          <div className="h-px flex-1 bg-base-mid/20" />

          {!selectionMode && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Espandi sezione" : "Comprimi sezione"}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-base-mid/10 text-base-mid hover:bg-base-mid/20"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      )}

      {!isCollapsed && (
        <>
          {tableNotes.length > 0 && (
            <div className="mb-3 space-y-3">
              {tableNotes.map((note) => (
                <div key={note.id} className="w-fit max-w-full">
                  {renderCard(note)}
                </div>
              ))}
            </div>
          )}

          {otherNotes.length > 0 && (
            <div
              className={
                viewMode === "grid"
                  ? "columns-2 gap-3 md:columns-3 xl:columns-4 2xl:columns-5"
                  : "columns-1 gap-3 lg:columns-2"
              }
            >
              {otherNotes.map((note) => (
                <div key={note.id} className="mb-3 break-inside-avoid">
                  {renderCard(note)}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
