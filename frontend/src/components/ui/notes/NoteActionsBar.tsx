// =================================
//  IMPORTS
// =================================
import { useState } from "react";
import { List, LayoutGrid, Plus, Check, CheckSquare, X, Search, Archive } from "lucide-react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Section } from "../../../api/sections";
import { NoteRefreshButton } from "./NoteRefreshButton";

// =================================
//  TYPE
// =================================
export type NoteViewMode = "list" | "grid";

// =================================
//  COMPONENT
// =================================
function SectionPill({
  section,
  isActive,
  onSelect,
}: {
  section: Section;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onSelect}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`shrink-0 cursor-grab rounded-full border px-3 py-1 text-xs font-medium active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      } ${
        isActive
          ? "border-accent bg-accent/10 text-accent"
          : "border-base-mid/25 text-base-mid hover:bg-base-mid/10"
      }`}
    >
      {section.name}
    </button>
  );
}

export function NoteActionsBar({
  sections,
  activeSectionId,
  onSectionChange,
  onSectionCreate,
  onSectionReorder,
  viewMode,
  onViewModeChange,
  onRefresh,
  selectionMode,
  onToggleSelectionMode,
  searchQuery,
  onSearchChange,
  viewFilter,
  onViewFilterChange,
}: {
  sections: Section[];
  activeSectionId: number | null;
  onSectionChange: (id: number | null) => void;
  onSectionCreate: (name: string) => void;
  onSectionReorder: (orderedIds: number[]) => void;
  viewMode: NoteViewMode;
  onViewModeChange: (mode: NoteViewMode) => void;
  onRefresh: () => void;
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewFilter: "active" | "archived";
  onViewFilterChange: (filter: "active" | "archived") => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  // Mouse: basta spostarsi di qualche pixel (un tap resta un tap/filtro).
  // Touch: serve una pressione prolungata, altrimenti uno swipe per scorrere
  // la barra verrebbe scambiato per un drag e non si potrebbe più scrollare.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 8 },
    }),
  );

  // =================================
  //  FUNCTIONS
  // =================================
  function handleAddSection(event: React.FormEvent) {
    event.preventDefault();
    const name = newSectionName.trim();
    if (!name) return;
    onSectionCreate(name);
    setNewSectionName("");
    setIsAddingSection(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onSectionReorder(
      arrayMove(sections, oldIndex, newIndex).map((section) => section.id),
    );
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="mb-4 space-y-2">
      {/* Riga sezioni: scorre orizzontalmente, il "+" resta fisso a destra e copre le chip che gli scorrono sotto */}
      <div className="relative">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => onSectionChange(null)}
            className={`shrink-0 cursor-pointer rounded-full border px-3 py-1 text-xs font-medium ${
              activeSectionId === null
                ? "border-accent bg-accent/10 text-accent"
                : "border-base-mid/25 text-base-mid hover:bg-base-mid/10"
            }`}
          >
            Tutte
          </button>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext
              items={sections.map((section) => section.id)}
              strategy={horizontalListSortingStrategy}
            >
              {sections.map((section) => (
                <SectionPill
                  key={section.id}
                  section={section}
                  isActive={activeSectionId === section.id}
                  onSelect={() => onSectionChange(section.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {isAddingSection && (
            <form
              onSubmit={handleAddSection}
              className="flex shrink-0 items-center gap-1"
            >
              <input
                autoFocus
                value={newSectionName}
                onChange={(event) => setNewSectionName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsAddingSection(false);
                    setNewSectionName("");
                  }
                }}
                onBlur={() => {
                  if (!newSectionName.trim()) setIsAddingSection(false);
                }}
                placeholder="Nome sezione"
                className="w-28 rounded-full border border-base-mid/40 px-3 py-1 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                aria-label="Conferma nuova sezione"
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-accent hover:bg-accent/10"
              >
                <Check size={14} />
              </button>
            </form>
          )}
        </div>

        {!isAddingSection && (
          <div className="absolute inset-y-0 right-0 flex w-10 items-center justify-end bg-base-light dark:bg-base-dark">
            <button
              type="button"
              onClick={() => setIsAddingSection(true)}
              aria-label="Aggiungi sezione"
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-dashed border-base-mid/40 text-base-mid hover:bg-base-mid/10"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Riga ricerca */}
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-base-mid"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cerca tra le note..."
          className="w-full rounded-full border border-base-mid/40 bg-transparent py-1.5 pr-8 pl-8 text-xs text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:text-base-light"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Cancella ricerca"
            className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-base-mid hover:bg-base-mid/10"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Riga opzioni: vista lista/griglia a sinistra, refresh a destra */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex overflow-hidden rounded-md border border-base-mid/40">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-label="Vista a griglia"
            className={`cursor-pointer p-1.5 ${
              viewMode === "grid"
                ? "bg-accent/10 text-accent"
                : "text-base-mid hover:bg-base-mid/10"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            aria-label="Vista a lista"
            className={`cursor-pointer border-l border-base-mid/40 p-1.5 ${
              viewMode === "list"
                ? "bg-accent/10 text-accent"
                : "text-base-mid hover:bg-base-mid/10"
            }`}
          >
            <List size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onViewFilterChange(viewFilter === "archived" ? "active" : "archived")
            }
            aria-pressed={viewFilter === "archived"}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
              viewFilter === "archived"
                ? "border-accent bg-accent/10 text-accent"
                : "border-base-mid/25 text-base-mid hover:bg-base-mid/10"
            }`}
          >
            <Archive size={14} />
            Archiviate
          </button>

          <button
            type="button"
            onClick={onToggleSelectionMode}
            aria-pressed={selectionMode}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
              selectionMode
                ? "border-accent bg-accent/10 text-accent"
                : "border-base-mid/25 text-base-mid hover:bg-base-mid/10"
            }`}
          >
            {selectionMode ? <X size={14} /> : <CheckSquare size={14} />}
            {selectionMode ? "Annulla" : "Seleziona"}
          </button>

          <NoteRefreshButton handleNoteRefresh={onRefresh} />
        </div>
      </div>
    </div>
  );
}
