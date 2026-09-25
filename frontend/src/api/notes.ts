import { apiFetch } from "./client";
import type { ReminderRecurrence } from "./reminders";
import type { UserSummary } from "./users";

// =================================
//  TYPES
// =================================
export type NoteReminder = {
  id: number;
  note_id: number;
  remind_at: string;
  recurrence: ReminderRecurrence;
  is_done: boolean;
};

export type NoteImage = {
  id: number;
  note_id: number;
  url: string;
};

export type NoteType = "plain" | "checklist" | "code" | "table";

export type ChecklistItem = { text: string; done: boolean };
export type NoteTable = { headers: string[]; rows: string[][] };

export type NoteBlockData =
  | { items: ChecklistItem[] }
  | { language: string; code: string }
  | NoteTable;

export type Note = {
  id: number;
  created_by: number;
  title: string | null;
  content: string;
  color: string | null;
  icon: string | null;
  note_type: NoteType;
  block_data: NoteBlockData | null;
  is_shared: boolean;
  has_reminder: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  sections: { id: number; name: string }[];
  author: UserSummary;
  shared_with_users: UserSummary[];
  reminders: NoteReminder[];
  images: NoteImage[];
};

// Promemoria da creare insieme alla nota (non fa parte del payload dell'API note)
export type NoteReminderInput = {
  remind_at: string;
  recurrence: ReminderRecurrence;
  is_done?: boolean;
};

export type NotePayload = {
  title?: string;
  content: string;
  color?: string;
  icon?: string;
  note_type?: NoteType;
  block_data?: NoteBlockData | null;
  section_ids?: number[];
  is_shared?: boolean;
  shared_with?: number[];
  is_pinned?: boolean;
};

// =================================
//  FUNCTIONS
// =================================
export function listNotes(token: string, sectionId?: number) {
  const query = sectionId ? `?section_id=${sectionId}` : "";
  return apiFetch<Note[]>(`/notes${query}`, { token });
}

export function createNote(token: string, payload: NotePayload) {
  return apiFetch<Note>("/notes", { method: "POST", body: payload, token });
}

export function updateNote(token: string, id: number, payload: NotePayload) {
  return apiFetch<Note>(`/notes/${id}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteNote(token: string, id: number) {
  return apiFetch<null>(`/notes/${id}`, { method: "DELETE", token });
}

export function uploadNoteImages(token: string, noteId: number, files: File[]) {
  const body = new FormData();
  files.forEach((file) => body.append("images[]", file));
  return apiFetch<NoteImage[]>(`/notes/${noteId}/images`, {
    method: "POST",
    body,
    token,
  });
}

export function deleteNoteImage(token: string, imageId: number) {
  return apiFetch<null>(`/note-images/${imageId}`, { method: "DELETE", token });
}
