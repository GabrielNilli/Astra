// =================================
//  IMPORTS
// =================================
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { searchUsers, type UserSummary } from "../../../api/users";

// =================================
//  CONSTS
// =================================
const DEBOUNCE_MS = 300;

// =================================
//  COMPONENT
// =================================
export function NoteSharePicker({
  selected,
  onChange,
  fieldClassName,
}: {
  selected: UserSummary[];
  onChange: (users: UserSummary[]) => void;
  fieldClassName: string;
}) {
  // =================================
  //  CONSTS
  // =================================
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const trimmedQuery = query.trim();
  const visibleResults = results.filter(
    (user) => !selected.some((picked) => picked.id === user.id),
  );

  // =================================
  //  FUNCTIONS
  // =================================
  function handlePick(user: UserSummary) {
    onChange([...selected, user]);
    setQuery("");
  }

  function handleRemove(id: number) {
    onChange(selected.filter((user) => user.id !== id));
  }

  // =================================
  //  USE EFFECTS
  // =================================
  useEffect(() => {
    if (!token || !isOpen) return;

    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchUsers(token, trimmedQuery)
        .then((users) => {
          if (!cancelled) setResults(users);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token, trimmedQuery, isOpen]);

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((user) => (
            <span
              key={user.id}
              className="flex items-center gap-1 rounded-full border border-accent bg-accent/10 py-0.5 pr-1 pl-2.5 text-xs text-accent"
            >
              {user.name}
              <button
                type="button"
                onClick={() => handleRemove(user.id)}
                aria-label={`Rimuovi ${user.name}`}
                className="cursor-pointer rounded-full p-0.5 hover:bg-accent/20"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        placeholder="Cerca utente per nome"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsOpen(true)}
        className={fieldClassName}
      />

      {isOpen && (
        <ul className="overflow-hidden rounded-md border border-base-mid/25 text-sm">
          {visibleResults.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => handlePick(user)}
                className="block w-full cursor-pointer px-3 py-2 text-left text-base-dark hover:bg-base-mid/10 dark:text-base-light"
              >
                {user.name}
              </button>
            </li>
          ))}
          {visibleResults.length === 0 && (
            <li className="px-3 py-2 text-base-mid">
              {isSearching ? "Ricerca..." : "Nessun utente trovato"}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
