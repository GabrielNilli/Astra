import { useEffect, useState } from "react";
import { listNotes, type Note } from "../api/notes";
import { noteMatchesQuery } from "../utils/noteSearch";

// La ricerca ignora sezione/archivio attivi: cerca sempre tra tutte le note non archiviate.
export function useNoteSearch(token: string | null) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || !token) {
      setSearchResults(null);
      return;
    }
    listNotes(token).then((all) =>
      setSearchResults(all.filter((note) => noteMatchesQuery(note, query))),
    );
  }, [searchQuery, token]);

  const isSearching = searchQuery.trim().length > 0;

  return { searchQuery, setSearchQuery, searchResults, isSearching };
}
