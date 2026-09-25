import type { Note } from "../api/notes";
import type { Section } from "../api/sections";

export type NoteGroup = { section: Section | null; notes: Note[] };

// Raggruppa le note per sezione (vista "Tutte"): una nota con più sezioni
// compare in ciascun gruppo di appartenenza, coerente coi conteggi dei filtri.
// Quando una sezione specifica è attiva, torna un unico gruppo con quella lista.
export function groupNotesBySection(
  notes: Note[],
  sections: Section[],
  activeSectionId: number | null,
): NoteGroup[] {
  if (activeSectionId !== null) {
    return [{ section: null, notes }];
  }

  return [
    ...sections
      .map((section) => ({
        section,
        notes: notes.filter((note) =>
          note.sections.some((noteSection) => noteSection.id === section.id),
        ),
      }))
      .filter((group) => group.notes.length > 0),
    {
      section: null,
      notes: notes.filter((note) => note.sections.length === 0),
    },
  ].filter((group) => group.notes.length > 0);
}
