// =================================
//  IMPORTS
// =================================
import { useState } from "react";
import type { Section } from "../../../api/sections";
import type { NotePayload } from "../../../api/notes";
import GenericButton from "../GenericButton";

// =================================
//  COMPONENT
// =================================
export function NoteFormModal({
  sections,
  onSubmit,
  onClose,
}: {
  sections: Section[];
  onSubmit: (payload: NotePayload) => void;
  onClose: () => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sectionId, setSectionId] = useState<number | "">("");

  // =================================
  //  FUNCTIONS
  // =================================
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    onSubmit({
      title: title.trim() || undefined,
      content,
      section_id: sectionId === "" ? null : sectionId,
    });
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-3 rounded-2xl border border-base-mid/25 bg-white p-4 dark:bg-base-dark"
      >
        <h2 className="text-lg font-semibold text-base-dark dark:text-base-light">
          Nuova nota
        </h2>

        <input
          type="text"
          placeholder="Titolo (opzionale)"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light"
        />

        <textarea
          placeholder="Contenuto"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          rows={4}
          className="w-full resize-none rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light"
        />

        <select
          value={sectionId}
          onChange={(event) =>
            setSectionId(event.target.value === "" ? "" : Number(event.target.value))
          }
          className="w-full rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light"
        >
          <option value="">Nessuna sezione</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2 pt-1">
          <GenericButton type="button" variant="secondary" onClick={onClose}>
            Annulla
          </GenericButton>
          <GenericButton type="submit" variant="primary">
            Crea
          </GenericButton>
        </div>
      </form>
    </div>
  );
}
