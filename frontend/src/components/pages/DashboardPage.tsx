// =================================
//  IMPORTS
// =================================
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlarmClock, Star } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { listNotes, type Note } from "../../api/notes";
import { listCharts, type Chart } from "../../api/charts";
import { stripHtmlToText } from "../../utils/richText";
import { resolveAccentColor } from "../../utils/chartColors";
import { useIsDarkMode } from "../../hooks/useIsDarkMode";
import { ChartCanvas } from "../ui/charts/ChartCanvas";

// =================================
//  CONSTS
// =================================
const MAX_ITEMS = 6;

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
};

// =================================
//  FUNCTIONS
// =================================
function formatDate(value: string) {
  return new Date(value).toLocaleDateString("it-IT", DATE_FORMAT);
}

// Promemoria non fatti più vicino nel tempo, poi le preferite senza promemoria
// (già coperte sopra se ce l'hanno): unione delle due richieste, non duplicati.
function pickHighlightedNotes(notes: Note[]): { note: Note; remindAt: string | null }[] {
  const withReminder = notes
    .map((note) => {
      const nextReminder = [...note.reminders]
        .filter((reminder) => !reminder.is_done)
        .sort((a, b) => a.remind_at.localeCompare(b.remind_at))[0];
      return nextReminder ? { note, remindAt: nextReminder.remind_at } : null;
    })
    .filter((entry): entry is { note: Note; remindAt: string } => entry !== null)
    .sort((a, b) => a.remindAt.localeCompare(b.remindAt));

  const withReminderIds = new Set(withReminder.map((entry) => entry.note.id));
  const favoriteOnly = notes
    .filter((note) => note.is_favorite && !withReminderIds.has(note.id))
    .map((note) => ({ note, remindAt: null }));

  return [...withReminder, ...favoriteOnly].slice(0, MAX_ITEMS);
}

function pickHighlightedCharts(charts: Chart[]): Chart[] {
  return charts
    .filter((chart) => chart.is_favorite)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, MAX_ITEMS);
}

// Un'anteprima breve e specifica per tipo, invece del solo titolo: il testo
// per le note semplici, un riassunto per checklist/tabella/codice.
function notePreview(note: Note): string | null {
  if (note.note_type === "checklist" && note.block_data && "items" in note.block_data) {
    const items = note.block_data.items;
    if (items.length === 0) return null;
    const done = items.filter((item) => item.done).length;
    return `Checklist — ${done}/${items.length} completate`;
  }
  if (note.note_type === "table" && note.block_data && "headers" in note.block_data) {
    return `Tabella — ${note.block_data.rows.length} righe`;
  }
  if (note.note_type === "code" && note.block_data && "code" in note.block_data) {
    return note.block_data.language ? `Codice (${note.block_data.language})` : "Codice";
  }
  const text = stripHtmlToText(note.content).trim();
  return text ? text.slice(0, 120) : null;
}

// =================================
//  COMPONENT
// =================================
export function DashboardPage() {
  // =================================
  //  CONSTS
  // =================================
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isDark = useIsDarkMode();
  const accent = resolveAccentColor();

  const [notes, setNotes] = useState<Note[]>([]);
  const [charts, setCharts] = useState<Chart[]>([]);

  const highlightedNotes = useMemo(() => pickHighlightedNotes(notes), [notes]);
  const highlightedCharts = useMemo(() => pickHighlightedCharts(charts), [charts]);

  const profileInfo = (
    <div className="flex items-center gap-3">
      {user?.profile_pic ? (
        <img
          src={user.profile_pic}
          alt={user.name}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-base-mid/20 text-sm font-semibold text-base-mid">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <h1 className="font-headline text-xl font-bold tracking-tight text-base-dark dark:text-base-light">
          Ciao, {user?.name}
        </h1>
        <p className="text-sm text-base-mid">{user?.email}</p>
      </div>
    </div>
  );

  // =================================
  //  USE EFFECTS
  // =================================
  useEffect(() => {
    if (!token) return;
    listNotes(token).then(setNotes);
    listCharts(token).then(setCharts);
  }, [token]);

  // =================================
  //  RENDER
  // =================================
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-base-mid/25 bg-white px-4 pt-6 pb-4 dark:bg-base-dark lg:hidden">
        {profileInfo}
      </header>
      <main className="w-full px-4 py-4 lg:px-8 lg:py-8">
        <div className="hidden lg:block">{profileInfo}</div>

        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-base-dark dark:text-base-light">
            Note
          </h2>
          {highlightedNotes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-base-mid/40 p-6 text-center text-sm text-base-mid">
              Nessun promemoria in arrivo né nota preferita.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {highlightedNotes.map(({ note, remindAt }) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => navigate(`/notes?note=${note.id}`)}
                  className="flex cursor-pointer flex-col gap-1 rounded-xl border border-base-mid/25 bg-white p-3 text-left hover:bg-base-mid/10 dark:bg-base-dark"
                  style={note.color ? { borderTopColor: note.color, borderTopWidth: 3 } : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    {remindAt ? (
                      <AlarmClock size={14} className="shrink-0 text-accent" />
                    ) : (
                      <Star size={14} className="shrink-0 fill-amber-400 text-amber-400" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-base-dark dark:text-base-light">
                      {note.title || "Senza titolo"}
                    </span>
                  </div>
                  {notePreview(note) && (
                    <p className="line-clamp-2 text-xs text-base-mid">{notePreview(note)}</p>
                  )}
                  {remindAt && (
                    <span className="text-[11px] font-medium text-accent">{formatDate(remindAt)}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-base-dark dark:text-base-light">
            Grafici
          </h2>
          {highlightedCharts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-base-mid/40 p-6 text-center text-sm text-base-mid">
              Nessun grafico preferito.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {highlightedCharts.map((chart) => (
                <button
                  key={chart.id}
                  type="button"
                  onClick={() => navigate("/charts")}
                  className="block w-full cursor-pointer rounded-xl border border-base-mid/25 bg-white p-3 text-left hover:bg-base-mid/10 dark:bg-base-dark"
                >
                  <div className="mb-1.5 flex items-center gap-1.5">
                    {chart.is_favorite && (
                      <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-base-dark dark:text-base-light">
                      {chart.name}
                    </span>
                  </div>
                  {chart.entries.length === 0 ? (
                    <p className="py-6 text-center text-xs text-base-mid">Nessun dato ancora</p>
                  ) : (
                    <div className="h-64">
                      <ChartCanvas chart={chart} accent={accent} isDark={isDark} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
