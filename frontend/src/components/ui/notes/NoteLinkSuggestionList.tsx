// =================================
//  IMPORTS
// =================================
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FileText } from "lucide-react";

// =================================
//  TYPES
// =================================
export type NoteLinkSuggestionItem = { id: number; title: string };

export type NoteLinkSuggestionListHandle = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

// =================================
//  COMPONENT
// =================================
export const NoteLinkSuggestionList = forwardRef<
  NoteLinkSuggestionListHandle,
  { items: NoteLinkSuggestionItem[]; command: (item: NoteLinkSuggestionItem) => void }
>(function NoteLinkSuggestionList({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  function selectItem(index: number) {
    const item = items[index];
    if (item) command(item);
  }

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (event.key === "ArrowUp") {
        setSelectedIndex((current) => (current + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((current) => (current + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="w-56 rounded-lg border border-base-mid/25 bg-white px-3 py-2 text-xs text-base-mid shadow-lg dark:bg-base-dark">
        Nessuna nota trovata
      </div>
    );
  }

  return (
    <div className="w-56 overflow-hidden rounded-lg border border-base-mid/25 bg-white py-1 text-sm shadow-lg dark:bg-base-dark">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => selectItem(index)}
          className={`flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-base-dark dark:text-base-light ${
            index === selectedIndex ? "bg-accent/10" : "hover:bg-base-mid/10"
          }`}
        >
          <FileText size={14} className="shrink-0 text-base-mid" />
          <span className="truncate">{item.title}</span>
        </button>
      ))}
    </div>
  );
});
