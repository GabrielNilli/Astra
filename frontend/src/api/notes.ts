import { apiFetch } from "./client";

// =================================
//  TYPES
// =================================
export type Note = {
  id: number;
  created_by: number;
  section_id: number | null;
  title: string | null;
  content: string;
  color: string | null;
  icon: string | null;
  is_shared: boolean;
  has_reminder: boolean;
  created_at: string;
  updated_at: string;
};

export type NotePayload = {
  title?: string;
  content: string;
  color?: string;
  icon?: string;
  section_id?: number | null;
  is_shared?: boolean;
  shared_with?: number[];
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
