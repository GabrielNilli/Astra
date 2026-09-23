// =================================
//  IMPORTS
// =================================
import GenericButton from "../GenericButton";

// =================================
//  COMPONENT
// =================================
export function NoteButton({ onClick }: { onClick: () => void }) {
  // =================================
  //  RENDER
  // =================================
  return (
    <GenericButton variant="primary" onClick={onClick}>
      Crea Nota
    </GenericButton>
  );
}
