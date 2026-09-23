// =================================
//  IMPORTS
// =================================
import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import { NoteLoadingState } from "../ui/notes/NoteLoadingState";
import { NoteEmptyState } from "../ui/notes/NoteEmptyState";
import { NoteActionsBar, type NoteViewMode } from "../ui/notes/NoteActionsBar";
import { NoteFormModal } from "../ui/notes/NoteFormModal";
import { NoteFab } from "../ui/notes/NoteFab";
import { GenericHeader } from "../ui/GenericHeader";
import { NoteCard } from "../ui/notes/NoteCard";

import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
  type Note,
  type NotePayload,
} from "../../api/notes";
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

  function handleSectionCreate(name: string) {
    if (!token) return;
    createSection(token, name).then((section) =>
      setSections((prev) => [...prev, section]),
    );
  }

  function handleNoteCreate(payload: NotePayload) {
    if (!token) return;
    createNote(token, payload).then(() => {
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
      <main className="mx-auto max-w-lg px-4 py-4">
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
                viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"
              }
            >
              {notesList.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleNoteDelete}
                  onColorChange={handleNoteColorChange}
                />
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
    </>
  );
}
