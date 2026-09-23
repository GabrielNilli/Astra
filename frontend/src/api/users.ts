import { apiFetch } from "./client";

// =================================
//  TYPES
// =================================
export type UserSummary = {
  id: number;
  name: string;
  profile_pic: string | null;
};

// =================================
//  FUNCTIONS
// =================================
export function searchUsers(token: string, query: string) {
  return apiFetch<UserSummary[]>(
    `/users/search?q=${encodeURIComponent(query)}`,
    { token },
  );
}
