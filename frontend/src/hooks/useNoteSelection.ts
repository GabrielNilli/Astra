import { useState } from "react";

// Stato della modalità multi-selezione delle note (bottone "Seleziona" o
// pressione prolungata su una card) e delle relative azioni bulk.
export function useNoteSelection() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  function toggleSelectionMode() {
    setSelectionMode((prev) => !prev);
    setSelectedIds(new Set());
  }

  function handleToggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleLongPressSelect(id: number) {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds(new Set([id]));
    } else {
      handleToggleSelect(id);
    }
  }

  function resetSelection() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  return {
    selectionMode,
    selectedIds,
    toggleSelectionMode,
    handleToggleSelect,
    handleLongPressSelect,
    resetSelection,
  };
}
