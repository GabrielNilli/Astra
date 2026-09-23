import { apiFetch } from "./client";

// =================================
//  TYPES
// =================================
export type Section = {
  id: number;
  created_by: number | null;
  name: string;
  is_preset: boolean;
  created_at: string;
  updated_at: string;
};

// =================================
//  FUNCTIONS
// =================================
export function listSections(token: string) {
  return apiFetch<Section[]>("/sections", { token });
}

export function createSection(token: string, name: string) {
  return apiFetch<Section>("/sections", {
    method: "POST",
    body: { name },
    token,
  });
}

export function deleteSection(token: string, id: number) {
  return apiFetch<null>(`/sections/${id}`, { method: "DELETE", token });
}
