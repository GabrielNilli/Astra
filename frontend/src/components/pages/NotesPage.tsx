// =================================
//  IMPORTS
// =================================
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useAuth } from "../../context/AuthContext";

import { NoteLoadingState } from "../ui/notes/NoteLoadingState";
import { NoteEmptyState } from "../ui/notes/NoteEmptyState";
import { NoteActionsBar, type NoteViewMode } from "../ui/notes/NoteActionsBar";
import { NoteFormModal, type NoteFormValues } from "../ui/notes/NoteFormModal";
import { NoteFab } from "../ui/notes/NoteFab";
import { NoteBulkActionsBar } from "../ui/notes/NoteBulkActionsBar";
import { GenericHeader } from "../ui/GenericHeader";
import { NoteCard } from "../ui/notes/NoteCard";

import {
  createNote,
  deleteNote,
  deleteNoteAttachment,
  deleteNoteImage,
  uploadNoteAttachments,
  uploadNoteImages,
  listNotes,
  updateNote,
  type Note,
} from "../../api/notes";
import { noteMatchesQuery } from "../../utils/noteSearch";
import { ApiError } from "../../api/client";
import {
  createReminder,
  deleteReminder,
  updateReminder,
} from "../../api/reminders";
import {
  createSection,
  listSections,
  reorderSections,
  type Section,
} from "../../api/sections";

// =================================
//  COMPONENT
// =================================
function SortableSectionGroup({
  section,
  notes,
  showHeader,
  viewMode,
  sections,
  onDelete,
  onColorChange,
  onSectionsChange,
  onDuplicate,
  onEdit,
  onChecklistToggle,
  onPinToggle,
  onArchiveToggle,
  onReminderToggle,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onLongPressSelect,
}: {
  section: Section | null;
  notes: Note[];
  showHeader: boolean;
  viewMode: NoteViewMode;
  sections: Section[];
  onDelete: (id: number) => void;
  onColorChange: (id: number, color: string) => void;
  onSectionsChange: (id: number, sectionIds: number[]) => void;
  onDuplicate: (id: number) => void;
  onEdit: (note: Note) => void;
  onChecklistToggle: (id: number, itemIndex: number) => void;
  onPinToggle: (id: number, pinned: boolean) => void;
  onArchiveToggle: (id: number, archived: boolean) => void;
  onReminderToggle: (reminderId: number, done: boolean) => void;
  selectionMode: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onLongPressSelect: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: section?.id ?? "none", disabled: section === null });

  // Le note con tabella vengono renderizzate a parte (fuori dalla griglia a
  // colonne), che altrimenti forzerebbe anche loro alla larghezza fissa della
  // colonna costringendo la tabella a scrollare.
  const tableNotes = notes.filter((note) => note.note_type === "table");
  const otherNotes = notes.filter((note) => note.note_type !== "table");

  return (
    <section
      ref={section ? setNodeRef : undefined}
      style={
        section
          ? { transform: CSS.Transform.toString(transform), transition }
          : undefined
      }
      className={`mb-6 last:mb-0 ${section && isDragging ? "opacity-50" : ""}`}
    >
      {showHeader && (
        <div className="mb-2 flex items-center gap-2">
          {section && (
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label="Trascina per riordinare la sezione"
              className="flex shrink-0 cursor-grab touch-none items-center text-base-mid hover:text-base-dark active:cursor-grabbing dark:hover:text-base-light"
            >
              <GripVertical size={14} />
            </button>
          )}
          <h2 className="shrink-0 text-sm font-semibold text-base-dark dark:text-base-light">
            {section?.name ?? "Senza sezione"}
          </h2>
          <span className="shrink-0 text-xs text-base-mid">{notes.length}</span>
          <div className="h-px flex-1 bg-base-mid/20" />
        </div>
      )}

      {tableNotes.length > 0 && (
        <div className="mb-3 space-y-3">
          {tableNotes.map((note) => (
            <div key={note.id} className="w-fit max-w-full">
              {renderCard(note)}
            </div>
          ))}
        </div>
      )}

      {otherNotes.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "columns-2 gap-3 md:columns-3 xl:columns-4 2xl:columns-5"
              : "columns-1 gap-3 lg:columns-2"
          }
        >
          {otherNotes.map((note) => (
            <div key={note.id} className="mb-3 break-inside-avoid">
              {renderCard(note)}
            </div>
          ))}
        </div>
      )}
    </section>
  );

  // Le note con tabella escono dalla griglia a colonne (che forza tutte le
  // card alla stessa larghezza): così possono allargarsi fino alla larghezza
  // naturale della tabella invece di scrollare dentro una colonna stretta.
  function renderCard(note: Note) {
    return (
      <NoteCard
        note={note}
        sections={sections}
        onDelete={onDelete}
        onColorChange={onColorChange}
        onSectionsChange={onSectionsChange}
        onDuplicate={onDuplicate}
        onEdit={onEdit}
        onChecklistToggle={onChecklistToggle}
        onPinToggle={onPinToggle}
        onArchiveToggle={onArchiveToggle}
        onReminderToggle={onReminderToggle}
        selectionMode={selectionMode}
        isSelected={selectedIds.has(note.id)}
        onToggleSelect={onToggleSelect}
        onLongPressSelect={onLongPressSelect}
      />
    );
  }
}

export function NotesPage() {
  // =================================
  //  CONSTS
  // =================================
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [notesList, setNotesList] = useState<Note[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [viewFilter, setViewFilter] = useState<"active" | "archived">("active");
  const [viewMode, setViewMode] = useState<NoteViewMode>("grid");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  // Stessa soglia della barra pillole: un tap sull'intestazione resta un tap,
  // il drag scatta solo spostando il puntatore di qualche pixel.
  const groupDragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // =================================
  //  FUNCTIONS
  // =================================
  function handleNoteRefresh() {
    if (!token) return;
    setIsLoading(true);
    listNotes(
      token,
      viewFilter === "archived" ? undefined : (activeSectionId ?? undefined),
      { archived: viewFilter === "archived" },
    )
      .then(setNotesList)
      .finally(() => setIsLoading(false));
  }

  function handleViewFilterChange(filter: "active" | "archived") {
    setViewFilter(filter);
    setActiveSectionId(null);
  }

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

  function toggleSelectionMode() {
    setSelectionMode((prev) => !prev);
    setSelectedIds(new Set());
  }

  function handleToggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleLongPressSelect(id: number) {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds(new Set([id]));
    } else {
      handleToggleSelect(id);
    }
  }

  function handleBulkDelete() {
    if (!token || selectedIds.size === 0) return;
    if (!window.confirm(`Eliminare ${selectedIds.size} note selezionate?`)) return;

    Promise.all([...selectedIds].map((id) => deleteNote(token, id))).then(() => {
      setSelectionMode(false);
      setSelectedIds(new Set());
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
      setSelectionMode(false);
      setSelectedIds(new Set());
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
    updateReminder(token, reminderId, { is_done: done }).then(
      handleNoteRefresh,
    );
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

  function handleSectionCreate(name: string) {
    if (!token) return;
    createSection(token, name).then((section) =>
      setSections((prev) => [...prev, section]),
    );
  }

  function handleSectionReorder(orderedIds: number[]) {
    if (!token) return;
    // Riordino ottimistico: l'ordine è quello che guida anche i gruppi di note in "Tutte"
    setSections((prev) =>
      [...prev].sort(
        (a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id),
      ),
    );
    reorderSections(token, orderedIds);
  }

  // Stesso riordino di handleSectionReorder, innescato però dal trascinamento
  // delle intestazioni di sezione nella vista "Tutte" invece che dalle pillole.
  function handleGroupDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    handleSectionReorder(
      arrayMove(sections, oldIndex, newIndex).map((section) => section.id),
    );
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

  // Raggruppa le note per sezione (vista "Tutte"): una nota con più sezioni
  // compare in ciascun gruppo di appartenenza, coerente coi conteggi dei filtri.
  const groupedNotes =
    activeSectionId === null
      ? [
          ...sections
            .map((section) => ({
              section,
              notes: notesList.filter((note) =>
                note.sections.some((noteSection) => noteSection.id === section.id),
              ),
            }))
            .filter((group) => group.notes.length > 0),
          {
            section: null,
            notes: notesList.filter((note) => note.sections.length === 0),
          },
        ].filter((group) => group.notes.length > 0)
      : [{ section: null, notes: notesList }];

  const isSearching = searchQuery.trim().length > 0;
  const displayGroups = isSearching
    ? [{ section: null, notes: searchResults ?? [] }]
    : groupedNotes;

  // =================================
  //  USE EFFECTS
  // =================================
  useEffect(() => {
    handleNoteRefresh();
  }, [token, activeSectionId, viewFilter]);

  useEffect(() => {
    if (!token) return;
    listSections(token).then(setSections);
  }, [token]);

  // La ricerca ignora sezione/archivio attivi: cerca sempre tra tutte le note non archiviate.
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || !token) {
      setSearchResults(null);
      return;
    }
    listNotes(token).then((all) =>
      setSearchResults(all.filter((note) => noteMatchesQuery(note, query))),
    );
  }, [searchQuery, token]);

  // Apre direttamente una nota quando si arriva da un link tipo /notes?note=123
  // (es. dal click su una notifica push di un reminder).
  useEffect(() => {
    const noteId = searchParams.get("note");
    if (!noteId || notesList.length === 0) return;

    const note = notesList.find((n) => n.id === Number(noteId));
    if (note) setEditingNote(note);

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("note");
        return next;
      },
      { replace: true },
    );
  }, [notesList, searchParams, setSearchParams]);

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
          onSectionChange={(id) => {
            setActiveSectionId(id);
            setViewFilter("active");
          }}
          onSectionCreate={handleSectionCreate}
          onSectionReorder={handleSectionReorder}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={handleNoteRefresh}
          selectionMode={selectionMode}
          onToggleSelectionMode={toggleSelectionMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewFilter={viewFilter}
          onViewFilterChange={handleViewFilterChange}
        />

        {isSearching && searchResults === null ? (
          <NoteLoadingState />
        ) : isSearching && searchResults!.length === 0 ? (
          <p className="py-10 text-center text-sm text-base-mid">
            Nessuna nota trovata per "{searchQuery.trim()}".
          </p>
        ) : isLoading === true ? (
          <NoteLoadingState />
        ) : notesList.length === 0 ? (
          viewFilter === "archived" ? (
            <p className="py-10 text-center text-sm text-base-mid">
              Nessuna nota archiviata.
            </p>
          ) : (
            <NoteEmptyState onCreate={() => setShowCreateForm(true)} />
          )
        ) : (
          <DndContext sensors={groupDragSensors} onDragEnd={handleGroupDragEnd}>
            <SortableContext
              items={displayGroups
                .filter((group) => group.section !== null)
                .map((group) => group.section!.id)}
              strategy={verticalListSortingStrategy}
            >
              {displayGroups.map(({ section, notes: groupNotes }) => (
                <SortableSectionGroup
                  key={section?.id ?? "none"}
                  section={section}
                  notes={groupNotes}
                  showHeader={!isSearching && displayGroups.length > 1}
                  viewMode={viewMode}
                  sections={sections}
                  onDelete={handleNoteDelete}
                  onColorChange={handleNoteColorChange}
                  onSectionsChange={handleNoteSectionsChange}
                  onDuplicate={handleNoteDuplicate}
                  onEdit={setEditingNote}
                  onChecklistToggle={handleNoteChecklistToggle}
                  onPinToggle={handleNotePinToggle}
                  onArchiveToggle={handleNoteArchiveToggle}
                  onReminderToggle={handleReminderToggle}
                  selectionMode={selectionMode}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onLongPressSelect={handleLongPressSelect}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </main>

      {selectionMode ? (
        <NoteBulkActionsBar
          selectedCount={selectedIds.size}
          sections={sections}
          isArchivedView={viewFilter === "archived"}
          onPin={() => handleBulkPin(true)}
          onUnpin={() => handleBulkPin(false)}
          onAddSection={handleBulkAddSection}
          onArchive={() => handleBulkArchive(true)}
          onUnarchive={() => handleBulkArchive(false)}
          onDelete={handleBulkDelete}
          onCancel={toggleSelectionMode}
        />
      ) : (
        <NoteFab onClick={() => setShowCreateForm(true)} />
      )}

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
