import { apiFetch } from "./client";
import type { UserSummary } from "./users";

// =================================
//  TYPES
// =================================
export type ChartType =
  | "area"
  | "bar"
  | "bubble"
  | "doughnut"
  | "pie"
  | "line"
  | "polar"
  | "radar"
  | "scatter";

export type ChartEntry = {
  id: number;
  chart_id: number;
  value: string;
  color: string | null;
  recorded_on: string;
};

export type Chart = {
  id: number;
  created_by: number;
  name: string;
  type: ChartType;
  is_shared: boolean;
  author: UserSummary;
  shared_with_users: UserSummary[];
  entries: ChartEntry[];
};

export type ChartPayload = {
  name: string;
  type: ChartType;
  is_shared?: boolean;
  shared_with?: number[];
};

export type ChartEntryPayload = {
  value: number;
  color?: string;
  recorded_on: string;
};

// =================================
//  FUNCTIONS
// =================================
export function listCharts(token: string) {
  return apiFetch<Chart[]>("/charts", { token });
}

export function createChart(token: string, payload: ChartPayload) {
  return apiFetch<Chart>("/charts", { method: "POST", body: payload, token });
}

export function updateChart(
  token: string,
  id: number,
  payload: ChartPayload,
) {
  return apiFetch<Chart>(`/charts/${id}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function deleteChart(token: string, id: number) {
  return apiFetch<null>(`/charts/${id}`, { method: "DELETE", token });
}

export function createChartEntry(
  token: string,
  chartId: number,
  payload: ChartEntryPayload,
) {
  return apiFetch<ChartEntry>(`/charts/${chartId}/entries`, {
    method: "POST",
    body: payload,
    token,
  });
}

export function deleteChartEntry(token: string, entryId: number) {
  return apiFetch<null>(`/chart-entries/${entryId}`, {
    method: "DELETE",
    token,
  });
}
