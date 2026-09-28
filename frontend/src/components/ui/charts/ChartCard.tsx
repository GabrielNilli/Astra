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
import { ChartCanvas, entryLabel } from "./ChartCanvas";

// =================================
//  CONSTS
// =================================
const FIELD_CLASS =
  "w-full rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light";

type EntryMode = "single" | "bulk";

// =================================
//  COMPONENT
// =================================
export function ChartCard({
  chart,
  onEdit,
  onDelete,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onFavoriteToggle,
}: {
  chart: Chart;
  onEdit: () => void;
  onDelete: () => void;
  onAddEntry: (value: number, recordedOn: string, color: string, label?: string) => void;
  onEditEntry: (
    entryId: number,
    value: number,
    recordedOn: string,
    color: string,
    label?: string,
  ) => void;
  onDeleteEntry: (entry: ChartEntry) => void;
  onFavoriteToggle: (favorite: boolean) => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const isDark = useIsDarkMode();
  const accent = resolveAccentColor();
  const [entryMode, setEntryMode] = useState<EntryMode>("single");
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [color, setColor] = useState(() => resolveAccentColor());
  const [recordedOn, setRecordedOn] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [showEntries, setShowEntries] = useState(false);
  const isEditing = editingEntryId !== null;

  // =================================
  //  FUNCTIONS
  // =================================
  function resetForm() {
    setEditingEntryId(null);
    setValue("");
    setLabel("");
    setBulkText("");
  }

  function startEdit(entry: ChartEntry) {
    setEntryMode("single");
    setEditingEntryId(entry.id);
    setValue(String(entry.value));
    setLabel(entry.label ?? "");
    setColor(entry.color ?? resolveAccentColor());
    setRecordedOn(entry.recorded_on);
    setShowEntries(true);
  }

  function handleSingleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(value);
    if (!value.trim() || Number.isNaN(parsed) || !recordedOn) return;

    if (editingEntryId !== null) {
      onEditEntry(editingEntryId, parsed, recordedOn, color, label.trim() || undefined);
    } else {
      onAddEntry(parsed, recordedOn, color, label.trim() || undefined);
    }
    resetForm();
  }

  // Ogni riga: "Etichetta,Valore" oppure solo "Valore" (senza etichetta).
  // Tutte le righe condividono la stessa data e lo stesso colore del form.
  function handleBulkSubmit(event: FormEvent) {
    event.preventDefault();
    if (!recordedOn) return;

    const lines = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      const commaIndex = line.lastIndexOf(",");
      const rawLabel = commaIndex === -1 ? null : line.slice(0, commaIndex).trim();
      const rawValue = commaIndex === -1 ? line : line.slice(commaIndex + 1).trim();
      const parsed = Number(rawValue);
      if (Number.isNaN(parsed)) continue;

      onAddEntry(parsed, recordedOn, color, rawLabel || undefined);
    }
    resetForm();
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

      {!isEditing && (
        <div className="flex gap-1 rounded-md border border-base-mid/40 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setEntryMode("single")}
            className={`flex-1 cursor-pointer rounded px-2 py-1 font-medium ${
              entryMode === "single" ? "bg-accent/10 text-accent" : "text-base-mid hover:bg-base-mid/10"
            }`}
          >
            Singolo
          </button>
          <button
            type="button"
            onClick={() => setEntryMode("bulk")}
            className={`flex-1 cursor-pointer rounded px-2 py-1 font-medium ${
              entryMode === "bulk" ? "bg-accent/10 text-accent" : "text-base-mid hover:bg-base-mid/10"
            }`}
          >
            Multiplo
          </button>
        </div>
      )}

      {entryMode === "single" || isEditing ? (
        <form onSubmit={handleSingleSubmit} className="space-y-2">
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
              type="text"
              placeholder="Etichetta (opzionale)"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className={`${FIELD_CLASS} w-36`}
            />
            <input
              type="date"
              value={recordedOn}
              onChange={(event) => setRecordedOn(event.target.value)}
              className={`${FIELD_CLASS} w-40`}
            />
            <GenericButton type="submit" variant="secondary" className="text-xs">
              {isEditing ? "Salva modifiche" : "Aggiungi"}
            </GenericButton>
            {isEditing && (
              <GenericButton
                type="button"
                variant="secondary"
                className="text-xs"
                onClick={resetForm}
              >
                Annulla
              </GenericButton>
            )}
          </div>
          <ColorPicker
            value={color}
            onChange={setColor}
            presets={COLOR_PRESETS}
            swatchClassName="h-5 w-5"
          />
        </form>
      ) : (
        <form onSubmit={handleBulkSubmit} className="space-y-2">
          <textarea
            placeholder={"Un valore per riga, es.\nCibo,50\nTrasporti,30\n120"}
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            rows={4}
            className={`${FIELD_CLASS} resize-none`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={recordedOn}
              onChange={(event) => setRecordedOn(event.target.value)}
              className={`${FIELD_CLASS} w-40`}
            />
            <GenericButton type="submit" variant="secondary" className="text-xs">
              Aggiungi tutti
            </GenericButton>
          </div>
          <ColorPicker
            value={color}
            onChange={setColor}
            presets={COLOR_PRESETS}
            swatchClassName="h-5 w-5"
          />
        </form>
      )}

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
              className={`flex items-center justify-between rounded-md px-2 py-1 hover:bg-base-mid/10 ${
                editingEntryId === entry.id ? "bg-accent/10" : ""
              }`}
            >
              <span className="flex items-center gap-2 text-base-dark dark:text-base-light">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color ?? accent }}
                />
                {entryLabel(entry)} — {Number(entry.value)}
              </span>
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(entry)}
                  aria-label="Modifica valore"
                  className="cursor-pointer rounded-md p-1 text-base-mid hover:text-accent"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteEntry(entry)}
                  aria-label="Elimina valore"
                  className="cursor-pointer rounded-md p-1 text-base-mid hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
