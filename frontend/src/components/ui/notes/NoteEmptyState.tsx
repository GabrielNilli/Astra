// =================================
//  IMPORTS
// =================================
import { StickyNote } from "lucide-react";
import { NoteButton } from "./NoteButton";

// =================================
//  COMPONENT
// =================================
export function NoteEmptyState({ onCreate }: { onCreate: () => void }) {
  // =================================
  //  RENDER
  // =================================
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
        <StickyNote size={26} />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-base-dark dark:text-base-light">
          Ancora nessuna nota
        </p>
        <p className="text-sm text-base-mid">
          Clicca sul pulsante per crearne subito una
        </p>
      </div>
      <NoteButton onClick={onCreate} />
    </div>
  );
}
