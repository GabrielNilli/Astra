// =================================
//  IMPORTS
// =================================
import { NoteButton } from "./NoteButton";

// =================================
//  COMPONENT
// =================================
export function NoteEmptyState({ onCreate }: { onCreate: () => void }) {
  // =================================
  //  RENDER
  // =================================
  return (
    <>
      <p>Ancora nessuna nota</p>
      <p>Clicca sul pulsante per crearne subito una</p>
      <NoteButton onClick={onCreate} />
    </>
  );
}
