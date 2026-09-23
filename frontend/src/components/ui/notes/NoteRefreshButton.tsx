// =================================
//  IMPORTS
// =================================
import { RotateCw } from "lucide-react";
import GenericButton from "../GenericButton";

// =================================
//  COMPONENT
// =================================
export function NoteRefreshButton({
  handleNoteRefresh,
}: {
  handleNoteRefresh: () => void;
}) {
  // =================================
  //  RENDER
  // =================================
  return (
    <GenericButton
      variant="secondary"
      onClick={handleNoteRefresh}
      aria-label="Ricarica note"
      className="px-2.5"
    >
      <RotateCw size={16} />
    </GenericButton>
  );
}
