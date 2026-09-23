// =================================
//  IMPORTS
// =================================
import { LoaderCircle } from "lucide-react";

// =================================
//  COMPONENT
// =================================
export function NoteLoadingState() {
  // =================================
  //  RENDER
  // =================================
  return (
    <div className="flex items-center justify-center py-12">
      <LoaderCircle className="animate-spin text-accent" size={28} />
    </div>
  );
}
