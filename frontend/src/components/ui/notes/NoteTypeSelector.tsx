// =================================
//  IMPORTS
// =================================
import { AlignLeft, BarChart3, Code2, ListChecks } from "lucide-react";
import type { NoteType } from "../../../api/notes";

// =================================
//  CONSTS
// =================================
const TYPE_OPTIONS: { value: NoteType; label: string; icon: typeof AlignLeft }[] = [
  { value: "plain", label: "Testo", icon: AlignLeft },
  { value: "checklist", label: "Checklist", icon: ListChecks },
  { value: "code", label: "Codice", icon: Code2 },
  { value: "stats", label: "Statistiche", icon: BarChart3 },
];

// =================================
//  COMPONENT
// =================================
export function NoteTypeSelector({
  value,
  onChange,
}: {
  value: NoteType;
  onChange: (type: NoteType) => void;
}) {
  // =================================
  //  RENDER
  // =================================
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {TYPE_OPTIONS.map(({ value: optionValue, label, icon: Icon }) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-medium transition-colors ${
            value === optionValue
              ? "border-accent bg-accent/10 text-accent"
              : "cursor-pointer border-base-mid/25 text-base-mid hover:bg-base-mid/10"
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}
