// =================================
//  IMPORTS
// =================================
import { useState, type FormEvent } from "react";
import type { Chart, ChartPayload, ChartType } from "../../../api/charts";
import type { UserSummary } from "../../../api/users";
import { NoteSharePicker } from "../notes/NoteSharePicker";
import GenericButton from "../GenericButton";

// =================================
//  CONSTS
// =================================
const FIELD_CLASS =
  "w-full rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light";

const TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "line", label: "Linee" },
  { value: "area", label: "Area" },
  { value: "bar", label: "Barre" },
  { value: "pie", label: "Torta" },
  { value: "doughnut", label: "Anello" },
  { value: "polar", label: "Polare" },
  { value: "radar", label: "Radar" },
  { value: "scatter", label: "Dispersione" },
  { value: "bubble", label: "Bolle" },
];

// =================================
//  COMPONENT
// =================================
export function ChartFormModal({
  chart,
  onSubmit,
  onClose,
}: {
  chart?: Chart;
  onSubmit: (payload: ChartPayload) => void;
  onClose: () => void;
}) {
  // =================================
  //  CONSTS
  // =================================
  const isEditing = chart !== undefined;
  const [name, setName] = useState(chart?.name ?? "");
  const [type, setType] = useState<ChartType>(chart?.type ?? "line");
  const [isShared, setIsShared] = useState(Boolean(chart?.is_shared));
  const [sharedWith, setSharedWith] = useState<UserSummary[]>(
    chart?.shared_with_users ?? [],
  );

  // =================================
  //  FUNCTIONS
  // =================================
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      type,
      is_shared: isShared,
      shared_with: sharedWith.map((user) => user.id),
    });
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-3 rounded-2xl border border-base-mid/25 bg-white p-4 dark:bg-base-dark md:p-6"
      >
        <h2 className="text-lg font-semibold text-base-dark dark:text-base-light">
          {isEditing ? "Modifica grafico" : "Nuovo grafico"}
        </h2>

        <input
          type="text"
          placeholder="Nome del grafico"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={FIELD_CLASS}
          autoFocus
        />

        <select
          value={type}
          onChange={(event) => setType(event.target.value as ChartType)}
          className={FIELD_CLASS}
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-base-dark dark:text-base-light">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(event) => setIsShared(event.target.checked)}
              className="accent-accent"
            />
            Condividi con altri utenti
          </label>

          {isShared && (
            <NoteSharePicker
              selected={sharedWith}
              onChange={setSharedWith}
              fieldClassName={FIELD_CLASS}
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <GenericButton type="button" variant="secondary" onClick={onClose}>
            Annulla
          </GenericButton>
          <GenericButton type="submit" variant="primary">
            {isEditing ? "Salva" : "Crea"}
          </GenericButton>
        </div>
      </form>
    </div>
  );
}
