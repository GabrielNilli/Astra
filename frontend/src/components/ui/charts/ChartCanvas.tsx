// =================================
//  IMPORTS
// =================================
import { useMemo } from "react";
import { Bar, Bubble, Doughnut, Line, Pie, PolarArea, Radar, Scatter } from "react-chartjs-2";
import type { Chart } from "../../../api/charts";
import { sequentialRamp } from "../../../utils/chartColors";

// =================================
//  CONSTS
// =================================
// I tipi "a fetta" colorano ogni punto singolarmente (magnitudine, non
// identità: qui non c'è una categoria stabile da distinguere), gli altri
// sono tutti una singola serie nel colore accent dell'utente.
export const SLICE_TYPES = new Set(["pie", "doughnut", "polar"]);

// =================================
//  FUNCTIONS
// =================================
export function formatLabel(recordedOn: string): string {
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

// =================================
//  COMPONENT
// =================================
export function ChartCanvas({
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

  // Nello scatter la x è il timestamp in ms (serve numerica per la scala
  // lineare): senza questo formatter l'asse mostra il numero grezzo invece
  // della data.
  const formatDateTick = (value: number) =>
    new Date(value).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });

  // Le tacche auto-generate dalla scala lineare non cadono sui confini dei
  // giorni: qui le sostituiamo con una tacca sola per ogni giorno che ha
  // davvero un valore, invece di nasconderne il testo lasciando lo spazio vuoto.
  const uniqueDayTicks = Array.from(
    new Set(chart.entries.map((entry) => new Date(entry.recorded_on).getTime())),
  ).sort((a, b) => a - b);

  const scatterScales = {
    x: {
      ticks: {
        color: inkColor,
        callback: (value: string | number) => formatDateTick(Number(value)),
      },
      afterBuildTicks: (axis: { ticks: { value: number }[] }) => {
        axis.ticks = uniqueDayTicks.map((value) => ({ value }));
      },
      grid: { color: gridColor },
    },
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
          options={{ ...commonOptions, scales: scatterScales }}
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
