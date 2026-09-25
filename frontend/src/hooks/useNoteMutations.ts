import {
  createNote,
  deleteNote,
  deleteNoteAttachment,
  deleteNoteImage,
  uploadNoteAttachments,
  uploadNoteImages,
  updateNote,
  type Note,
} from "../api/notes";
import { ApiError } from "../api/client";
import {
  createReminder,
  deleteReminder,
  updateReminder,
} from "../api/reminders";
import type { NoteFormValues } from "../components/ui/notes/NoteFormModal";

// Tutte le azioni che creano/modificano/cancellano note (singole e bulk),
// promemoria inclusi. Prende in input lo stato posseduto da NotesPage e
// restituisce i soli handler, così la pagina resta un compositore di hook
// invece di ~500 righe di funzioni inline.
export function useNoteMutations({
  token,
  notesList,
  searchResults,
  activeSectionId,
  selectedIds,
  setNotesList,
  handleNoteRefresh,
  resetSelection,
  setEditingNote,
  setShowCreateForm,
}: {
  token: string | null;
  notesList: Note[];
  searchResults: Note[] | null;
  activeSectionId: number | null;
  selectedIds: Set<number>;
  setNotesList: React.Dispatch<React.SetStateAction<Note[]>>;
  handleNoteRefresh: () => void;
  resetSelection: () => void;
  setEditingNote: (note: Note | null) => void;
  setShowCreateForm: (show: boolean) => void;
}) {
  // Una nota agita dai risultati di ricerca può non essere nella notesList
  // filtrata per sezione/archivio attualmente caricata.
  function findNote(id: number): Note | undefined {
    return notesList.find((n) => n.id === id) ?? searchResults?.find((n) => n.id === id);
  }

  function handleNoteDelete(id: number) {
    if (!token) return;
    deleteNote(token, id).then(handleNoteRefresh);
  }

  function handleNoteColorChange(id: number, color: string) {
    if (!token) return;
    const note = findNote(id);
    if (!note) return;
    updateNote(token, id, {
      title: note.title ?? undefined,
      content: note.content,
      color,
    }).then(handleNoteRefresh);
  }

  function handleNoteSectionsChange(id: number, sectionIds: number[]) {
    if (!token) return;
    const note = findNote(id);
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
    const note = findNote(id);
    if (!note) return;
    // Copia il contenuto e l'aspetto; condivisione, promemoria e pin restano solo all'originale
    createNote(token, {
      title: note.title ?? undefined,
      content: note.content,
      color: note.color ?? undefined,
      icon: note.icon ?? undefined,
      note_type: note.note_type,
      block_data: note.block_data ?? undefined,
      section_ids: note.sections.map((section) => section.id),
    }).then(handleNoteRefresh);
  }

  function handleNoteChecklistToggle(id: number, itemIndex: number) {
    if (!token) return;
    const note = findNote(id);
    if (!note || note.note_type !== "checklist" || !note.block_data || !("items" in note.block_data)) {
      return;
    }
    const items = note.block_data.items.map((item, index) =>
      index === itemIndex ? { ...item, done: !item.done } : item,
    );
    updateNote(token, id, {
      title: note.title ?? undefined,
      content: note.content,
      note_type: "checklist",
      block_data: { items },
    }).then(handleNoteRefresh);
  }

  function handleNotePinToggle(id: number, pinned: boolean) {
    if (!token) return;
    const note = findNote(id);
    if (!note) return;
    updateNote(token, id, {
      title: note.title ?? undefined,
      content: note.content,
      is_pinned: pinned,
    }).then(handleNoteRefresh);
  }

  function handleNoteArchiveToggle(id: number, archived: boolean) {
    if (!token) return;
    const note = findNote(id);
    if (!note) return;
    updateNote(token, id, {
      title: note.title ?? undefined,
      content: note.content,
      is_archived: archived,
    }).then(handleNoteRefresh);
  }

  function handleBulkDelete() {
    if (!token || selectedIds.size === 0) return;
    if (!window.confirm(`Eliminare ${selectedIds.size} note selezionate?`)) return;

    Promise.all([...selectedIds].map((id) => deleteNote(token, id))).then(() => {
      resetSelection();
      handleNoteRefresh();
    });
  }

  function handleBulkPin(pinned: boolean) {
    if (!token || selectedIds.size === 0) return;

    Promise.all(
      [...selectedIds].map((id) => {
        const note = findNote(id);
        if (!note) return Promise.resolve();
        return updateNote(token, id, {
          title: note.title ?? undefined,
          content: note.content,
          is_pinned: pinned,
        });
      }),
    ).then(handleNoteRefresh);
  }

  function handleBulkArchive(archived: boolean) {
    if (!token || selectedIds.size === 0) return;

    Promise.all(
      [...selectedIds].map((id) => {
        const note = findNote(id);
        if (!note) return Promise.resolve();
        return updateNote(token, id, {
          title: note.title ?? undefined,
          content: note.content,
          is_archived: archived,
        });
      }),
    ).then(() => {
      resetSelection();
      handleNoteRefresh();
    });
  }

  function handleBulkAddSection(sectionId: number) {
    if (!token || selectedIds.size === 0) return;

    Promise.all(
      [...selectedIds].map((id) => {
        const note = findNote(id);
        if (!note) return Promise.resolve();
        const sectionIds = new Set(note.sections.map((section) => section.id));
        sectionIds.add(sectionId);
        return updateNote(token, id, {
          title: note.title ?? undefined,
          content: note.content,
          section_ids: [...sectionIds],
        });
      }),
    ).then(handleNoteRefresh);
  }

  function handleReminderToggle(reminderId: number, done: boolean) {
    if (!token) return;
    updateReminder(token, reminderId, { is_done: done }).then(handleNoteRefresh);
  }

  function handleNoteEdit(
    id: number,
    {
      note,
      reminder,
      newImages,
      removedImageIds,
      newAttachments,
      removedAttachmentIds,
    }: NoteFormValues,
  ) {
    if (!token) return;
    const existing = findNote(id)?.reminders[0];

    updateNote(token, id, note)
      .then(async () => {
        await Promise.all(
          removedImageIds.map((imageId) => deleteNoteImage(token, imageId)),
        );
        if (newImages.length > 0) {
          await uploadNoteImages(token, id, newImages);
        }

        await Promise.all(
          removedAttachmentIds.map((attachmentId) => deleteNoteAttachment(token, attachmentId)),
        );
        if (newAttachments.length > 0) {
          await uploadNoteAttachments(token, id, newAttachments);
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
      })
      .catch((err) => {
        window.alert(
          err instanceof ApiError ? err.message : "Impossibile salvare la nota.",
        );
        handleNoteRefresh();
      });
  }

  function handleNoteCreate({ note, reminder, newImages, newAttachments }: NoteFormValues) {
    if (!token) return;
    createNote(token, note)
      .then(async (created) => {
        if (newImages.length > 0) {
          await uploadNoteImages(token, created.id, newImages);
        }
        if (newAttachments.length > 0) {
          await uploadNoteAttachments(token, created.id, newAttachments);
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
      })
      .catch((err) => {
        window.alert(
          err instanceof ApiError ? err.message : "Impossibile creare la nota.",
        );
        handleNoteRefresh();
      });
  }

  return {
    handleNoteDelete,
    handleNoteColorChange,
    handleNoteSectionsChange,
    handleNoteDuplicate,
    handleNoteChecklistToggle,
    handleNotePinToggle,
    handleNoteArchiveToggle,
    handleBulkDelete,
    handleBulkPin,
    handleBulkArchive,
    handleBulkAddSection,
    handleReminderToggle,
    handleNoteEdit,
    handleNoteCreate,
  };
}
