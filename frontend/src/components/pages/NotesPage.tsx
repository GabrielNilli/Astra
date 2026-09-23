// =================================
//  IMPORTS
// =================================
import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import { NoteLoadingState } from "../ui/notes/NoteLoadingState";
import { NoteEmptyState } from "../ui/notes/NoteEmptyState";
import { NoteActionsBar, type NoteViewMode } from "../ui/notes/NoteActionsBar";
import { NoteFormModal, type NoteFormValues } from "../ui/notes/NoteFormModal";
import { NoteFab } from "../ui/notes/NoteFab";
import { GenericHeader } from "../ui/GenericHeader";
import { NoteCard } from "../ui/notes/NoteCard";

import {
  createNote,
  deleteNote,
  deleteNoteImage,
  uploadNoteImages,
  listNotes,
  updateNote,
  type Note,
} from "../../api/notes";
import {
  createReminder,
  deleteReminder,
  updateReminder,
} from "../../api/reminders";
import { createSection, listSections, type Section } from "../../api/sections";

// =================================
//  COMPONENT
// =================================
export function NotesPage() {
  // =================================
  //  CONSTS
  // =================================
  const { token } = useAuth();

  const [notesList, setNotesList] = useState<Note[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<NoteViewMode>("list");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // =================================
  //  FUNCTIONS
  // =================================
  function handleNoteRefresh() {
    if (!token) return;
    setIsLoading(true);
    listNotes(token, activeSectionId ?? undefined)
      .then(setNotesList)
      .finally(() => setIsLoading(false));
  }

  function handleNoteDelete(id: number) {
    if (!token) return;
    deleteNote(token, id).then(handleNoteRefresh);
  }

  function handleNoteColorChange(id: number, color: string) {
    if (!token) return;
    const note = notesList.find((n) => n.id === id);
    if (!note) return;
    updateNote(token, id, {
      title: note.title ?? undefined,
      content: note.content,
      color,
    }).then(handleNoteRefresh);
  }

  function handleNoteSectionsChange(id: number, sectionIds: number[]) {
    if (!token) return;
    const note = notesList.find((n) => n.id === id);
    if (!note) return;
    updateNote(token, id, {
      title: note.title ?? undefined,
      content: note.content,
      section_ids: sectionIds,
    }).then((updated) => {
      // Sostituzione locale: senza il ricaricamento il menu resta aperto per più spunte
      setNotesList((prev) =>
        activeSectionId !== null &&
        !updated.sections.some((section) => section.id === activeSectionId)
          ? prev.filter((n) => n.id !== id)
          : prev.map((n) => (n.id === id ? updated : n)),
      );
    });
  }

  function handleNoteDuplicate(id: number) {
    if (!token) return;
    const note = notesList.find((n) => n.id === id);
    if (!note) return;
    // Copia il contenuto e l'aspetto; condivisione e promemoria restano solo all'originale
    createNote(token, {
      title: note.title ?? undefined,
      content: note.content,
      color: note.color ?? undefined,
      icon: note.icon ?? undefined,
      section_ids: note.sections.map((section) => section.id),
    }).then(handleNoteRefresh);
  }

  function handleNoteEdit(
    id: number,
    { note, reminder, newImages, removedImageIds }: NoteFormValues,
  ) {
    if (!token) return;
    const existing = notesList.find((n) => n.id === id)?.reminders[0];

    updateNote(token, id, note)
      .then(async () => {
        await Promise.all(
          removedImageIds.map((imageId) => deleteNoteImage(token, imageId)),
        );
        if (newImages.length > 0) {
          await uploadNoteImages(token, id, newImages);
        }

        if (reminder && existing) {
          await updateReminder(token, existing.id, reminder);
        } else if (reminder) {
          await createReminder(token, {
            note_id: id,
            title: note.title || "Promemoria nota",
            ...reminder,
          });
        } else if (existing) {
          await deleteReminder(token, existing.id);
        }
      })
      .then(() => {
        setEditingNote(null);
        handleNoteRefresh();
      });
  }

  function handleSectionCreate(name: string) {
    if (!token) return;
    createSection(token, name).then((section) =>
      setSections((prev) => [...prev, section]),
    );
  }

  function handleNoteCreate({ note, reminder, newImages }: NoteFormValues) {
    if (!token) return;
    createNote(token, note)
      .then(async (created) => {
        if (newImages.length > 0) {
          await uploadNoteImages(token, created.id, newImages);
        }
        if (reminder) {
          await createReminder(token, {
            note_id: created.id,
            title: created.title || "Promemoria nota",
            ...reminder,
          });
        }
      })
      .then(() => {
        setShowCreateForm(false);
        handleNoteRefresh();
      });
  }

  // =================================
  //  USE EFFECTS
  // =================================
  useEffect(() => {
    handleNoteRefresh();
  }, [token, activeSectionId]);

  useEffect(() => {
    if (!token) return;
    listSections(token).then(setSections);
  }, [token]);

  // =================================
  //  RENDER
  // =================================
  return (
    <>
      <GenericHeader headerTitle="Note" />
      <main className="w-full px-4 py-4 lg:px-8">
        <NoteActionsBar
          sections={sections}
          activeSectionId={activeSectionId}
          onSectionChange={setActiveSectionId}
          onSectionCreate={handleSectionCreate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={handleNoteRefresh}
        />

        {isLoading === true ? (
          <NoteLoadingState />
        ) : notesList.length === 0 ? (
          <NoteEmptyState onCreate={() => setShowCreateForm(true)} />
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "columns-2 gap-3 md:columns-3 xl:columns-4 2xl:columns-5"
                  : "columns-1 gap-3 lg:columns-2"
              }
            >
              {notesList.map((note) => (
                <div key={note.id} className="mb-3 break-inside-avoid">
                  <NoteCard
                    note={note}
                    sections={sections}
                    onDelete={handleNoteDelete}
                    onColorChange={handleNoteColorChange}
                    onSectionsChange={handleNoteSectionsChange}
                    onDuplicate={handleNoteDuplicate}
                    onEdit={setEditingNote}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <NoteFab onClick={() => setShowCreateForm(true)} />

      {showCreateForm && (
        <NoteFormModal
          sections={sections}
          onSubmit={handleNoteCreate}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {editingNote && (
        <NoteFormModal
          key={editingNote.id}
          note={editingNote}
          sections={sections}
          onSubmit={(values) => handleNoteEdit(editingNote.id, values)}
          onClose={() => setEditingNote(null)}
        />
      )}
    </>
  );
}
