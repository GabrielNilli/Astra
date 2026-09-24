// =================================
//  IMPORTS
// =================================
import { Plus, X } from "lucide-react";
import type { ChecklistItem } from "../../../api/notes";

// =================================
//  COMPONENT
// =================================
export function ChecklistEditor({
  items,
  onChange,
  fieldClassName,
}: {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  fieldClassName: string;
}) {
  // =================================
  //  FUNCTIONS
  // =================================
  function updateItem(index: number, patch: Partial<ChecklistItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, { text: "", done: false }]);
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="space-y-1.5">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={item.done}
            onChange={(event) => updateItem(index, { done: event.target.checked })}
            className="accent-accent"
          />
          <input
            type="text"
            placeholder="Voce checklist"
            value={item.text}
            onChange={(event) => updateItem(index, { text: event.target.value })}
            className={`${fieldClassName} flex-1`}
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            aria-label="Rimuovi voce"
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-mid hover:bg-base-mid/10"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="flex cursor-pointer items-center gap-1 text-xs font-medium text-accent hover:underline"
      >
        <Plus size={14} />
        Aggiungi voce
      </button>
    </div>
  );
}
