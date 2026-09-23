import { apiFetch } from "./client";

// =================================
//  TYPES
// =================================
export type ReminderRecurrence =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export type ReminderPayload = {
  note_id?: number | null;
  title: string;
  description?: string;
  remind_at: string;
  recurrence?: ReminderRecurrence;
};

// =================================
//  FUNCTIONS
// =================================
export function createReminder(token: string, payload: ReminderPayload) {
  return apiFetch<unknown>("/reminders", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateReminder(
  token: string,
  id: number,
  payload: Partial<Pick<ReminderPayload, "title" | "remind_at" | "recurrence">> & {
    is_done?: boolean;
  },
) {
  return apiFetch<unknown>(`/reminders/${id}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteReminder(token: string, id: number) {
  return apiFetch<null>(`/reminders/${id}`, { method: "DELETE", token });
}
