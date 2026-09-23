// =================================
//  IMPORTS
// =================================
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  ALL_ICON_NAMES,
  EXTRA_NOTE_ICONS,
  NOTE_ICONS,
  resolveNoteIcon,
} from "../../../constants/noteIcons";

// =================================
//  CONSTS
// =================================
const MAX_SEARCH_RESULTS = 60;

// =================================
//  COMPONENT
// =================================
export function NoteIconPicker({
  value,
  onChange,
  fieldClassName,
}: {
  value: string | null;
  onChange: (icon: string | null) => void;
  fieldClassName: string;
}) {
  // =================================
  //  CONSTS
  // =================================
  const [showMore, setShowMore] = useState(false);
  const [query, setQuery] = useState("");

  const isQuickIcon = NOTE_ICONS.some(({ name }) => name === value);
  // Un'icona scelta dal pannello resta visibile accanto alle rapide anche a pannello chiuso
  const ExtraSelected = !isQuickIcon ? resolveNoteIcon(value) : null;

  const normalizedQuery = query.trim().toLowerCase();
  const visibleNames = normalizedQuery
    ? ALL_ICON_NAMES.filter((name) =>
        name.toLowerCase().includes(normalizedQuery.replace(/[\s-_]/g, "")),
      ).slice(0, MAX_SEARCH_RESULTS)
    : EXTRA_NOTE_ICONS;

  // =================================
  //  FUNCTIONS
  // =================================
  function buttonClass(isActive: boolean) {
    return `cursor-pointer rounded-md border p-1.5 ${
      isActive
        ? "border-accent bg-accent/10 text-accent"
        : "border-base-mid/40 text-base-mid hover:bg-base-mid/10"
    }`;
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`cursor-pointer rounded-md border px-2 py-1 text-xs ${
            value === null
              ? "border-accent bg-accent/10 text-accent"
              : "border-base-mid/40 text-base-mid hover:bg-base-mid/10"
          }`}
        >
          Nessuna
        </button>
        {NOTE_ICONS.map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            aria-label={`Icona ${name}`}
            className={buttonClass(value === name)}
          >
            <Icon size={16} />
          </button>
        ))}
        {ExtraSelected && (
          <button
            type="button"
            aria-label={`Icona ${value}`}
            className={buttonClass(true)}
          >
            <ExtraSelected size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowMore((current) => !current)}
          aria-label="Altre icone"
          aria-expanded={showMore}
          className="cursor-pointer rounded-md border border-dashed border-base-mid/40 p-1.5 text-base-mid hover:bg-base-mid/10"
        >
          <Plus size={16} />
        </button>
      </div>

      {showMore && (
        <div className="space-y-2 rounded-md border border-base-mid/25 p-2">
          <input
            type="text"
            placeholder="Cerca icona (es. car, calendar)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={fieldClassName}
          />
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
            {visibleNames.map((name) => {
              const Icon = resolveNoteIcon(name);
              if (!Icon) return null;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={`Icona ${name}`}
                  onClick={() => {
                    onChange(name);
                    setShowMore(false);
                    setQuery("");
                  }}
                  className={buttonClass(value === name)}
                >
                  <Icon size={16} />
                </button>
              );
            })}
            {visibleNames.length === 0 && (
              <p className="px-1 py-2 text-xs text-base-mid">
                Nessuna icona trovata
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
