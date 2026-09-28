// =================================
//  IMPORTS
// =================================
import { useState, type FormEvent } from "react";
import { Pencil, Star, Trash2, Users, X } from "lucide-react";
import type { Chart, ChartEntry } from "../../../api/charts";
import { resolveAccentColor } from "../../../utils/chartColors";
import { useIsDarkMode } from "../../../hooks/useIsDarkMode";
import { COLOR_PRESETS } from "../../../constants/colors";
import GenericButton from "../GenericButton";
import { ColorPicker } from "../ColorPicker";
import { ChartCanvas, formatLabel } from "./ChartCanvas";

// =================================
//  CONSTS
// =================================
const FIELD_CLASS =
  "w-full rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light";

// =================================
//  COMPONENT
// =================================
export function ChartCard({
  chart,
  onEdit,
  onDelete,
  onAddEntry,
  onDeleteEntry,
  onFavoriteToggle,
}: {
  chart: Chart;
  onEdit: () => void;
  onDelete: () => void;
  onAddEntry: (value: number, recordedOn: string, color: string) => void;
  onDeleteEntry: (entry: ChartEntry) => void;
  onFavoriteToggle: (favorite: boolean) => void;
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
            onClick={() => onFavoriteToggle(!chart.is_favorite)}
            aria-label={chart.is_favorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
            className="cursor-pointer rounded-md p-1.5 text-base-mid hover:bg-base-mid/10"
          >
            <Star size={16} className={chart.is_favorite ? "fill-amber-400 text-amber-400" : ""} />
          </button>
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
