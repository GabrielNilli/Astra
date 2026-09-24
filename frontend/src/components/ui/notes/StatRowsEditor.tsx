// =================================
//  IMPORTS
// =================================
import { Plus, X } from "lucide-react";
import type { StatRow } from "../../../api/notes";

// =================================
//  COMPONENT
// =================================
export function StatRowsEditor({
  rows,
  onChange,
  fieldClassName,
}: {
  rows: StatRow[];
  onChange: (rows: StatRow[]) => void;
  fieldClassName: string;
}) {
  // =================================
  //  FUNCTIONS
  // =================================
  function updateRow(index: number, patch: Partial<StatRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...rows, { label: "", value: "" }]);
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="space-y-1.5">
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Etichetta"
            value={row.label}
            onChange={(event) => updateRow(index, { label: event.target.value })}
            className={`${fieldClassName} flex-1`}
          />
          <input
            type="text"
            placeholder="Valore"
            value={row.value}
            onChange={(event) => updateRow(index, { value: event.target.value })}
            className={`${fieldClassName} flex-1`}
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            aria-label="Rimuovi riga"
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-mid hover:bg-base-mid/10"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="flex cursor-pointer items-center gap-1 text-xs font-medium text-accent hover:underline"
      >
        <Plus size={14} />
        Aggiungi riga
      </button>
    </div>
  );
}
