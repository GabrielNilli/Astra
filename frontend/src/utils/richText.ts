import DOMPurify from "dompurify";

// =================================
//  CONSTS
// =================================
const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "blockquote",
  "br",
  "a",
];

const ALLOWED_ATTR = ["href", "target", "rel", "style"];

// Il preflight di Tailwind azzera list-style, margini di blockquote e persino
// colore/sottolineatura dei link: senza queste classi il markup c'è ma è invisibile.
// Condivisa tra l'editor live e il render di sola lettura in NoteCard.
export const RICH_TEXT_CONTENT_CLASS =
  "[&_a]:text-accent [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-base-mid/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_li]:ml-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-1 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5";

// =================================
//  FUNCTIONS
// =================================
// Le note esistenti hanno contenuto testo semplice: senza tag riconoscibili
// va trattato come legacy invece che iniettato come HTML.
export function looksLikeHtml(content: string): boolean {
  return HTML_TAG_PATTERN.test(content);
}

// Converte il testo semplice legacy in HTML equivalente (un <p> per riga),
// così l'editor TipTap parte da un contenuto fedele invece di perdere gli a-capo.
export function plainTextToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split("\n")
    .map((line) => `<p>${line || "<br>"}</p>`)
    .join("");
}

// Sanifica l'HTML prodotto dall'editor prima del render: le note sono condivisibili,
// quindi un contenuto malevolo inviato direttamente all'API deve restare inerte.
export function sanitizeNoteHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

export function stripHtmlToText(html: string): string {
  if (!looksLikeHtml(html)) return html;
  const parsed = new DOMParser().parseFromString(
    sanitizeNoteHtml(html),
    "text/html",
  );
  return parsed.body.textContent ?? "";
}

export function isContentEmpty(content: string): boolean {
  return stripHtmlToText(content).trim().length === 0;
}
