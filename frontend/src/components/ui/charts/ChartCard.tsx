// =================================
//  IMPORTS
// =================================
import { useMemo, useState, type FormEvent } from "react";
import { Bar, Bubble, Doughnut, Line, Pie, PolarArea, Radar, Scatter } from "react-chartjs-2";
import { Pencil, Trash2, Users, X } from "lucide-react";
import type { Chart, ChartEntry } from "../../../api/charts";
import { resolveAccentColor, sequentialRamp } from "../../../utils/chartColors";
import { useIsDarkMode } from "../../../hooks/useIsDarkMode";
import { COLOR_PRESETS } from "../../../constants/colors";
import GenericButton from "../GenericButton";
import { ColorPicker } from "../ColorPicker";

// =================================
//  CONSTS
// =================================
const FIELD_CLASS =
  "w-full rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light";

// I tipi "a fetta" colorano ogni punto singolarmente (magnitudine, non
// identità: qui non c'è una categoria stabile da distinguere), gli altri
// sono tutti una singola serie nel colore accent dell'utente.
const SLICE_TYPES = new Set(["pie", "doughnut", "polar"]);

// =================================
//  FUNCTIONS
// =================================
function formatLabel(recordedOn: string): string {
  return new Date(`${recordedOn}T00:00:00`).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
  });
}

// Ogni ramo restituisce una forma dati diversa (etichette+numeri, o punti
// {x,y}/{x,y,r}) a seconda del tipo scelto: react-chartjs-2 tipizza `data`
// in base al componente specifico, quindi qui usiamo `any` e lasciamo che
// sia lo switch a runtime in ChartCanvas a garantire la corrispondenza.
function buildChartData(chart: Chart, accent: string): any {
  const entries = chart.entries;
  const labels = entries.map((entry) => formatLabel(entry.recorded_on));
  const values = entries.map((entry) => Number(entry.value));

  // Ogni valore porta il colore scelto dall'utente al momento dell'inserimento;
  // la rampa sequenziale copre solo le entry più vecchie senza colore salvato.
  const fallbackColors = sequentialRamp(accent, Math.max(entries.length, 1));
  const colors = entries.map((entry, index) => entry.color ?? fallbackColors[index]);

  if (SLICE_TYPES.has(chart.type)) {
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    };
  }

  if (chart.type === "scatter") {
    return {
      datasets: [
        {
          label: chart.name,
          data: entries.map((entry) => ({
            x: new Date(entry.recorded_on).getTime(),
            y: Number(entry.value),
          })),
          backgroundColor: colors,
        },
      ],
    };
  }

  if (chart.type === "bubble") {
    return {
      datasets: [
        {
          label: chart.name,
          data: entries.map((entry, index) => ({
            x: index,
            y: Number(entry.value),
            r: Math.min(28, Math.max(6, Math.sqrt(Number(entry.value)) * 2)),
          })),
          backgroundColor: colors.map((color) => `${color}99`),
          borderColor: colors,
        },
      ],
    };
  }

  if (chart.type === "bar") {
    return {
      labels,
      datasets: [
        {
          label: chart.name,
          data: values,
          backgroundColor: colors,
          borderRadius: 4,
        },
      ],
    };
  }

  return {
    labels,
    datasets: [
      {
        label: chart.name,
        data: values,
        borderColor: accent,
        backgroundColor: chart.type === "area" ? `${accent}33` : accent,
        pointBackgroundColor: colors,
        fill: chart.type === "area",
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };
}

function ChartCanvas({
  chart,
  accent,
  isDark,
}: {
  chart: Chart;
  accent: string;
  isDark: boolean;
}) {
  const data = useMemo(() => buildChartData(chart, accent), [chart, accent]);

  const inkColor = isDark ? "#eeeeee" : "#3a3f43";
  const gridColor = isDark ? "rgba(238,238,238,0.12)" : "rgba(58,63,67,0.12)";

  const hasLegend = SLICE_TYPES.has(chart.type);
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: hasLegend, labels: { color: inkColor } },
      tooltip: { enabled: true },
    },
  };

  const cartesianScales = {
    x: { ticks: { color: inkColor }, grid: { color: gridColor } },
    y: { ticks: { color: inkColor }, grid: { color: gridColor } },
  };

  const radialScales = {
    r: {
      ticks: { color: inkColor, backdropColor: "transparent" },
      grid: { color: gridColor },
      angleLines: { color: gridColor },
      pointLabels: { color: inkColor },
    },
  };

  switch (chart.type) {
    case "pie":
      return <Pie data={data} options={commonOptions} />;
    case "doughnut":
      return <Doughnut data={data} options={commonOptions} />;
    case "polar":
      return (
        <PolarArea
          data={data}
          options={{ ...commonOptions, scales: radialScales }}
        />
      );
    case "radar":
      return (
        <Radar
          data={data}
          options={{ ...commonOptions, scales: radialScales }}
        />
      );
    case "bar":
      return (
        <Bar data={data} options={{ ...commonOptions, scales: cartesianScales }} />
      );
    case "scatter":
      return (
        <Scatter
          data={data}
          options={{ ...commonOptions, scales: cartesianScales }}
        />
      );
    case "bubble":
      return (
        <Bubble
          data={data}
          options={{ ...commonOptions, scales: cartesianScales }}
        />
      );
    default:
      return (
        <Line data={data} options={{ ...commonOptions, scales: cartesianScales }} />
      );
  }
}

// =================================
//  COMPONENT
// =================================
export function ChartCard({
  chart,
  onEdit,
  onDelete,
  onAddEntry,
  onDeleteEntry,
}: {
  chart: Chart;
  onEdit: () => void;
  onDelete: () => void;
  onAddEntry: (value: number, recordedOn: string, color: string) => void;
  onDeleteEntry: (entry: ChartEntry) => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const isDark = useIsDarkMode();
  const accent = resolveAccentColor();
  const [value, setValue] = useState("");
  const [color, setColor] = useState(() => resolveAccentColor());
  const [recordedOn, setRecordedOn] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [showEntries, setShowEntries] = useState(false);

  // =================================
  //  FUNCTIONS
  // =================================
  function handleAddEntry(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(value);
    if (!value.trim() || Number.isNaN(parsed) || !recordedOn) return;

    onAddEntry(parsed, recordedOn, color);
    setValue("");
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="space-y-3 rounded-2xl border border-base-mid/25 bg-white p-4 dark:bg-base-dark">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-base-dark dark:text-base-light">
            {chart.name}
          </h3>
          {chart.is_shared && (
            <span className="flex items-center gap-1 text-xs text-base-mid">
              <Users size={12} /> Condiviso
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Modifica grafico"
            className="cursor-pointer rounded-md p-1.5 text-base-mid hover:bg-base-mid/10"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Elimina grafico"
            className="cursor-pointer rounded-md p-1.5 text-base-mid hover:bg-red-600/10 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {chart.entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-base-mid">
          Nessun dato ancora, aggiungi il primo valore qui sotto.
        </p>
      ) : (
        <div className="h-56">
          <ChartCanvas chart={chart} accent={accent} isDark={isDark} />
        </div>
      )}

      <form onSubmit={handleAddEntry} className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="any"
            placeholder="Valore"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className={`${FIELD_CLASS} w-24`}
          />
          <input
            type="date"
            value={recordedOn}
            onChange={(event) => setRecordedOn(event.target.value)}
            className={`${FIELD_CLASS} w-40`}
          />
          <GenericButton type="submit" variant="secondary" className="text-xs">
            Aggiungi
          </GenericButton>
        </div>
        <ColorPicker
          value={color}
          onChange={setColor}
          presets={COLOR_PRESETS}
          swatchClassName="h-5 w-5"
        />
      </form>

      {chart.entries.length > 0 && (
        <button
          type="button"
          onClick={() => setShowEntries((prev) => !prev)}
          className="cursor-pointer text-xs text-accent hover:underline"
        >
          {showEntries
            ? "Nascondi valori"
            : `Mostra ${chart.entries.length} valori`}
        </button>
      )}

      {showEntries && (
        <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
          {chart.entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-base-mid/10"
            >
              <span className="flex items-center gap-2 text-base-dark dark:text-base-light">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color ?? accent }}
                />
                {formatLabel(entry.recorded_on)} — {Number(entry.value)}
              </span>
              <button
                type="button"
                onClick={() => onDeleteEntry(entry)}
                aria-label="Elimina valore"
                className="cursor-pointer rounded-md p-1 text-base-mid hover:text-red-600"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
