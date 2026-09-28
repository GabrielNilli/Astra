// =================================
//  IMPORTS
// =================================
import { useState } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { BarChart3 } from "lucide-react";

import { GenericHeader } from "../ui/GenericHeader";
import { NoteLoadingState } from "../ui/notes/NoteLoadingState";
import { ChartCard } from "../ui/charts/ChartCard";
import { ChartFab } from "../ui/charts/ChartFab";
import { ChartFormModal } from "../ui/charts/ChartFormModal";

import { useAuth } from "../../context/AuthContext";
import { useChartsData } from "../../hooks/useChartsData";
import {
  createChart,
  createChartEntry,
  deleteChart,
  deleteChartEntry,
  updateChart,
  updateChartEntry,
  type Chart,
  type ChartEntry,
  type ChartPayload,
} from "../../api/charts";

// =================================
//  REGISTER
// =================================
ChartJS.register(...registerables);

// =================================
//  COMPONENT
// =================================
export function ChartsPage() {
  // =================================
  //  CONSTS
  // =================================
  const { token } = useAuth();
  const { chartsList, setChartsList, isLoading, handleChartsRefresh } =
    useChartsData(token);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingChart, setEditingChart] = useState<Chart | null>(null);

  // =================================
  //  FUNCTIONS
  // =================================
  function handleChartCreate(payload: ChartPayload) {
    if (!token) return;
    createChart(token, payload).then(() => {
      setShowCreateForm(false);
      handleChartsRefresh();
    });
  }

  function handleChartEdit(id: number, payload: ChartPayload) {
    if (!token) return;
    updateChart(token, id, payload).then((updated) => {
      setEditingChart(null);
      setChartsList((prev) => prev.map((c) => (c.id === id ? updated : c)));
    });
  }

  function handleFavoriteToggle(chart: Chart, favorite: boolean) {
    if (!token) return;
    updateChart(token, chart.id, {
      name: chart.name,
      type: chart.type,
      is_favorite: favorite,
    }).then((updated) => {
      setChartsList((prev) => prev.map((c) => (c.id === chart.id ? updated : c)));
    });
  }

  function handleChartDelete(id: number) {
    if (!token) return;
    if (!window.confirm("Eliminare questo grafico e tutti i suoi valori?")) return;
    deleteChart(token, id).then(() =>
      setChartsList((prev) => prev.filter((c) => c.id !== id)),
    );
  }

  function handleEntryAdd(
    chartId: number,
    value: number,
    recordedOn: string,
    color: string,
    label?: string,
  ) {
    if (!token) return;
    createChartEntry(token, chartId, {
      value,
      label,
      color,
      recorded_on: recordedOn,
    }).then((entry) => {
      setChartsList((prev) =>
        prev.map((c) =>
          c.id === chartId
            ? {
                ...c,
                entries: [...c.entries, entry].sort((a, b) =>
                  a.recorded_on.localeCompare(b.recorded_on),
                ),
              }
            : c,
        ),
      );
    });
  }

  function handleEntryEdit(
    chartId: number,
    entryId: number,
    value: number,
    recordedOn: string,
    color: string,
    label?: string,
  ) {
    if (!token) return;
    updateChartEntry(token, entryId, {
      value,
      label,
      color,
      recorded_on: recordedOn,
    }).then((updated) => {
      setChartsList((prev) =>
        prev.map((c) =>
          c.id === chartId
            ? {
                ...c,
                entries: c.entries
                  .map((e) => (e.id === entryId ? updated : e))
                  .sort((a, b) => a.recorded_on.localeCompare(b.recorded_on)),
              }
            : c,
        ),
      );
    });
  }

  function handleEntryDelete(chartId: number, entry: ChartEntry) {
    if (!token) return;
    deleteChartEntry(token, entry.id).then(() => {
      setChartsList((prev) =>
        prev.map((c) =>
          c.id === chartId
            ? { ...c, entries: c.entries.filter((e) => e.id !== entry.id) }
            : c,
        ),
      );
    });
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <>
      <GenericHeader headerTitle="Grafici" />
      <main className="w-full px-4 py-4 lg:px-8">
        {isLoading ? (
          <NoteLoadingState />
        ) : chartsList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <BarChart3 size={26} />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-base-dark dark:text-base-light">
                Ancora nessun grafico
              </p>
              <p className="text-sm text-base-mid">
                Clicca sul pulsante per crearne subito uno
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {chartsList.map((chart) => (
              <ChartCard
                key={chart.id}
                chart={chart}
                onEdit={() => setEditingChart(chart)}
                onDelete={() => handleChartDelete(chart.id)}
                onAddEntry={(value, recordedOn, color, label) =>
                  handleEntryAdd(chart.id, value, recordedOn, color, label)
                }
                onEditEntry={(entryId, value, recordedOn, color, label) =>
                  handleEntryEdit(chart.id, entryId, value, recordedOn, color, label)
                }
                onDeleteEntry={(entry) => handleEntryDelete(chart.id, entry)}
                onFavoriteToggle={(favorite) => handleFavoriteToggle(chart, favorite)}
              />
            ))}
          </div>
        )}
      </main>

      <ChartFab onClick={() => setShowCreateForm(true)} />

      {showCreateForm && (
        <ChartFormModal
          onSubmit={handleChartCreate}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {editingChart && (
        <ChartFormModal
          key={editingChart.id}
          chart={editingChart}
          onSubmit={(payload) => handleChartEdit(editingChart.id, payload)}
          onClose={() => setEditingChart(null)}
        />
      )}
    </>
  );
}
