import type { Note } from "../api/notes";
import { stripHtmlToText } from "./richText";

// =================================
//  FUNCTIONS
// =================================
// Testo cercabile di una nota: titolo, corpo, e il contenuto specifico del
// tipo (voci checklist, codice, celle tabella) e i nomi degli allegati.
function noteSearchText(note: Note): string {
  const parts = [note.title ?? "", stripHtmlToText(note.content)];

  if (note.block_data) {
    if ("items" in note.block_data) {
      parts.push(...note.block_data.items.map((item) => item.text));
    }
    if ("code" in note.block_data) {
      parts.push(note.block_data.code, note.block_data.language);
    }
    if ("headers" in note.block_data) {
      parts.push(...note.block_data.headers, ...note.block_data.rows.flat());
    }
  }

  parts.push(...note.attachments.map((attachment) => attachment.filename));

  return parts.join(" ").toLowerCase();
}

export function noteMatchesQuery(note: Note, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  return noteSearchText(note).includes(trimmed);
}
