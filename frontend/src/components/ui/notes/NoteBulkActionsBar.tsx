// =================================
//  IMPORTS
// =================================
import { useState } from "react";
import { Archive, ArchiveRestore, Bookmark, BookmarkX, FolderPlus, Trash2, X } from "lucide-react";
import type { Section } from "../../../api/sections";

// =================================
//  COMPONENT
// =================================
export function NoteBulkActionsBar({
  selectedCount,
  sections,
  isArchivedView,
  onPin,
  onUnpin,
  onAddSection,
  onArchive,
  onUnarchive,
  onDelete,
  onCancel,
}: {
  selectedCount: number;
  sections: Section[];
  isArchivedView: boolean;
  onPin: () => void;
  onUnpin: () => void;
  onAddSection: (sectionId: number) => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const disabled = selectedCount === 0;

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 lg:bottom-6">
      <div className="relative flex items-center gap-1 rounded-2xl border border-base-mid/25 bg-white px-3 py-2 shadow-lg dark:bg-base-dark">
        <span className="mr-1 shrink-0 text-sm font-medium text-base-dark dark:text-base-light">
          {selectedCount} selezionate
        </span>

        <button
          type="button"
          onClick={onPin}
          disabled={disabled}
          aria-label="Fissa in alto"
          title="Fissa in alto"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-mid hover:bg-base-mid/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Bookmark size={16} />
        </button>
        <button
          type="button"
          onClick={onUnpin}
          disabled={disabled}
          aria-label="Rimuovi dai fissati"
          title="Rimuovi dai fissati"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-mid hover:bg-base-mid/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <BookmarkX size={16} />
        </button>

        <button
          type="button"
          onClick={() => setShowSectionPicker((value) => !value)}
          disabled={disabled}
          aria-label="Sposta in sezione"
          title="Sposta in sezione"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-mid hover:bg-base-mid/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FolderPlus size={16} />
        </button>

        <button
          type="button"
          onClick={isArchivedView ? onUnarchive : onArchive}
          disabled={disabled}
          aria-label={isArchivedView ? "Disarchivia" : "Archivia"}
          title={isArchivedView ? "Disarchivia" : "Archivia"}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-mid hover:bg-base-mid/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isArchivedView ? <ArchiveRestore size={16} /> : <Archive size={16} />}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Elimina selezionate"
          title="Elimina selezionate"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-red-600 hover:bg-red-600/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={16} />
        </button>

        <div className="mx-1 h-6 w-px shrink-0 bg-base-mid/25" />

        <button
          type="button"
          onClick={onCancel}
          aria-label="Annulla selezione"
          title="Annulla selezione"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-mid hover:bg-base-mid/10"
        >
          <X size={16} />
        </button>

        {showSectionPicker && sections.length > 0 && (
          <div className="absolute right-0 bottom-full mb-2 w-48 overflow-hidden rounded-lg border border-base-mid/25 bg-white text-sm shadow-lg dark:bg-base-dark">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  onAddSection(section.id);
                  setShowSectionPicker(false);
                }}
                className="block w-full cursor-pointer px-3 py-2 text-left text-base-dark hover:bg-base-mid/10 dark:text-base-light"
              >
                {section.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
