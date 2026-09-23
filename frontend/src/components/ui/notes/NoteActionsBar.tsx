// =================================
//  IMPORTS
// =================================
import { useState } from "react";
import { List, LayoutGrid, Plus, Check } from "lucide-react";
import type { Section } from "../../../api/sections";
import { NoteRefreshButton } from "./NoteRefreshButton";

// =================================
//  TYPE
// =================================
export type NoteViewMode = "list" | "grid";

// =================================
//  COMPONENT
// =================================
export function NoteActionsBar({
  sections,
  activeSectionId,
  onSectionChange,
  onSectionCreate,
  viewMode,
  onViewModeChange,
  onRefresh,
}: {
  sections: Section[];
  activeSectionId: number | null;
  onSectionChange: (id: number | null) => void;
  onSectionCreate: (name: string) => void;
  viewMode: NoteViewMode;
  onViewModeChange: (mode: NoteViewMode) => void;
  onRefresh: () => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

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

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="mb-4 space-y-2">
      {/* Riga sezioni: scorre orizzontalmente, il "+" resta fisso a destra e copre le chip che gli scorrono sotto */}
      <div className="relative">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 pr-10">
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
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={`shrink-0 cursor-pointer rounded-full border px-3 py-1 text-xs font-medium ${
                activeSectionId === section.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-base-mid/25 text-base-mid hover:bg-base-mid/10"
              }`}
            >
              {section.name}
            </button>
          ))}

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
          <button
            type="button"
            onClick={() => setIsAddingSection(true)}
            aria-label="Aggiungi sezione"
            className="absolute top-1/2 right-0 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-dashed border-base-mid/40 bg-base-light text-base-mid hover:bg-base-mid/10 dark:bg-base-dark"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Riga opzioni: vista lista/griglia a sinistra, refresh a destra */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex overflow-hidden rounded-md border border-base-mid/40">
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            aria-label="Vista a lista"
            className={`cursor-pointer p-1.5 ${
              viewMode === "list"
                ? "bg-accent/10 text-accent"
                : "text-base-mid hover:bg-base-mid/10"
            }`}
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-label="Vista a griglia"
            className={`cursor-pointer border-l border-base-mid/40 p-1.5 ${
              viewMode === "grid"
                ? "bg-accent/10 text-accent"
                : "text-base-mid hover:bg-base-mid/10"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        <NoteRefreshButton handleNoteRefresh={onRefresh} />
      </div>
    </div>
  );
}
