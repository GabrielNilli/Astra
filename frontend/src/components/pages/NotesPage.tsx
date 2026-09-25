// =================================
//  IMPORTS
// =================================
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

import { useAuth } from "../../context/AuthContext";

import { NoteLoadingState } from "../ui/notes/NoteLoadingState";
import { NoteEmptyState } from "../ui/notes/NoteEmptyState";
import { NoteActionsBar, type NoteViewMode } from "../ui/notes/NoteActionsBar";
import { NoteFormModal } from "../ui/notes/NoteFormModal";
import { NoteFab } from "../ui/notes/NoteFab";
import { NoteBulkActionsBar } from "../ui/notes/NoteBulkActionsBar";
import { GenericHeader } from "../ui/GenericHeader";
import { SortableSectionGroup } from "../ui/notes/SortableSectionGroup";

import { type Note } from "../../api/notes";
import { createSection, listSections, reorderSections, type Section } from "../../api/sections";
import { groupNotesBySection } from "../../utils/noteGrouping";
import { useNotesData } from "../../hooks/useNotesData";
import { useNoteSearch } from "../../hooks/useNoteSearch";
import { useNoteSelection } from "../../hooks/useNoteSelection";
import { useNoteMutations } from "../../hooks/useNoteMutations";

// =================================
//  COMPONENT
// =================================
export function NotesPage() {
  // =================================
  //  CONSTS
  // =================================
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [viewFilter, setViewFilter] = useState<"active" | "archived">("active");
  const [viewMode, setViewMode] = useState<NoteViewMode>("grid");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const { notesList, setNotesList, isLoading, handleNoteRefresh } = useNotesData(
    token,
    activeSectionId,
    viewFilter,
  );
  const { searchQuery, setSearchQuery, searchResults, isSearching } = useNoteSearch(token);
  const {
    selectionMode,
    selectedIds,
    toggleSelectionMode,
    handleToggleSelect,
    handleLongPressSelect,
    resetSelection,
  } = useNoteSelection();
  const {
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
  } = useNoteMutations({
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
  });

  // Stessa soglia della barra pillole: un tap sull'intestazione resta un tap,
  // il drag scatta solo spostando il puntatore di qualche pixel.
  const groupDragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // =================================
  //  FUNCTIONS
  // =================================
  function handleViewFilterChange(filter: "active" | "archived") {
    setViewFilter(filter);
    setActiveSectionId(null);
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

  const groupedNotes = groupNotesBySection(notesList, sections, activeSectionId);
  const displayGroups = isSearching
    ? [{ section: null, notes: searchResults ?? [] }]
    : groupedNotes;

  // =================================
  //  USE EFFECTS
  // =================================
  useEffect(() => {
    if (!token) return;
    listSections(token).then(setSections);
  }, [token]);

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
