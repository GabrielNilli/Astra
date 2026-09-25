import TurndownService from "turndown";
import type { Note } from "../api/notes";
import { isContentEmpty, sanitizeNoteHtml } from "./richText";

// =================================
//  CONSTS
// =================================
const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });

// =================================
//  FUNCTIONS
// =================================
function blockDataToMarkdown(note: Note): string {
  if (!note.block_data) return "";

  if (note.note_type === "checklist" && "items" in note.block_data) {
    return note.block_data.items
      .map((item) => `- [${item.done ? "x" : " "}] ${item.text}`)
      .join("\n");
  }

  if (note.note_type === "code" && "code" in note.block_data) {
    return `\`\`\`${note.block_data.language}\n${note.block_data.code}\n\`\`\``;
  }

  if (note.note_type === "table" && "headers" in note.block_data) {
    const { headers, rows } = note.block_data;
    const headerLine = `| ${headers.join(" | ")} |`;
    const separatorLine = `| ${headers.map(() => "---").join(" | ")} |`;
    const rowLines = rows.map((row) => `| ${row.join(" | ")} |`);
    return [headerLine, separatorLine, ...rowLines].join("\n");
  }

  return "";
}

export function noteToMarkdown(note: Note): string {
  const sections: string[] = [`# ${note.title || "Senza titolo"}`];

  if (!isContentEmpty(note.content)) {
    sections.push(turndown.turndown(sanitizeNoteHtml(note.content)));
  }

  const blockMarkdown = blockDataToMarkdown(note);
  if (blockMarkdown) sections.push(blockMarkdown);

  if (note.attachments.length > 0) {
    sections.push(
      note.attachments.map((attachment) => `- [${attachment.filename}](${attachment.url})`).join("\n"),
    );
  }

  return sections.join("\n\n") + "\n";
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
