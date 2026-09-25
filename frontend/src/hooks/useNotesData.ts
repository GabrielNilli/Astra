import { useEffect, useState } from "react";
import { listNotes, type Note } from "../api/notes";

// Carica la lista note per la vista attiva (sezione + filtro archivio) e la
// tiene sincronizzata quando uno di questi cambia.
export function useNotesData(
  token: string | null,
  activeSectionId: number | null,
  viewFilter: "active" | "archived",
) {
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function handleNoteRefresh() {
    if (!token) return;
    setIsLoading(true);
    listNotes(
      token,
      viewFilter === "archived" ? undefined : (activeSectionId ?? undefined),
      { archived: viewFilter === "archived" },
    )
      .then(setNotesList)
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    handleNoteRefresh();
  }, [token, activeSectionId, viewFilter]);

  return { notesList, setNotesList, isLoading, handleNoteRefresh };
}
