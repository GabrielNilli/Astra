// =================================
//  IMPORTS
// =================================
import { Plus } from "lucide-react";

// =================================
//  COMPONENT
// =================================
export function NoteFab({ onClick }: { onClick: () => void }) {
  // =================================
  //  RENDER
  // =================================
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Crea nota"
      className="fixed right-5 bottom-20 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-md/90 hover:brightness-90 lg:bottom-6"
    >
      <Plus size={26} />
    </button>
  );
}
