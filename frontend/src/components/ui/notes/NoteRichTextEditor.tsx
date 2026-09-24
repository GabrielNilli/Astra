// =================================
//  IMPORTS
// =================================
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Link2Off,
} from "lucide-react";
import {
  looksLikeHtml,
  plainTextToHtml,
  RICH_TEXT_CONTENT_CLASS,
} from "../../../utils/richText";

// =================================
//  CONSTS
// =================================
const PARAGRAPH_OPTIONS = [
  { value: "paragraph", label: "Paragrafo" },
  { value: "1", label: "Titolo 1" },
  { value: "2", label: "Titolo 2" },
  { value: "3", label: "Titolo 3" },
];

// =================================
//  FUNCTIONS
// =================================
function currentParagraphValue(editor: Editor): string {
  if (editor.isActive("heading", { level: 1 })) return "1";
  if (editor.isActive("heading", { level: 2 })) return "2";
  if (editor.isActive("heading", { level: 3 })) return "3";
  return "paragraph";
}

function readToolbarState(editor: Editor) {
  return {
    paragraphValue: currentParagraphValue(editor),
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    bulletList: editor.isActive("bulletList"),
    orderedList: editor.isActive("orderedList"),
    blockquote: editor.isActive("blockquote"),
    alignLeft: editor.isActive({ textAlign: "left" }),
    alignCenter: editor.isActive({ textAlign: "center" }),
    alignRight: editor.isActive({ textAlign: "right" }),
    link: editor.isActive("link"),
  };
}

function toolbarButtonClass(active: boolean) {
  return `flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md ${
    active
      ? "bg-accent/10 text-accent"
      : "text-base-mid hover:bg-base-mid/10"
  }`;
}

// =================================
//  COMPONENT
// =================================
export function NoteRichTextEditor({
  value,
  onChange,
  fieldClassName,
}: {
  value: string;
  onChange: (html: string) => void;
  fieldClassName: string;
}) {
  // =================================
  //  CONSTS
  // =================================
  // Il valore iniziale conta solo al mount: da lì in poi l'editor è la fonte di
  // verità (evita di reimpostare il contenuto e perdere la posizione del cursore
  // ad ogni onChange del genitore).
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: false },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: looksLikeHtml(value) ? value : plainTextToHtml(value),
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `${fieldClassName} min-h-[7rem] resize-none rounded-t-none border-t-0 focus:ring-0 ${RICH_TEXT_CONTENT_CLASS}`,
      },
    },
  });

  // Ricalcola lo stato "attivo" dei pulsanti ad ogni transazione (selezione o
  // formattazione cambiate): editor.isActive(...) da solo non fa ri-renderizzare.
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current ? readToolbarState(current) : null,
  });

  // =================================
  //  FUNCTIONS
  // =================================
  function handleLinkToggle() {
    if (!editor) return;

    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const url = window.prompt("URL del link")?.trim();
    if (!url) return;

    if (editor.state.selection.empty) {
      // Senza testo selezionato setLink non ha nulla su cui applicare il mark:
      // inseriamo l'URL stesso come testo linkato, invece di non fare nulla.
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: url,
          marks: [{ type: "link", attrs: { href: url } }],
        })
        .run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  }

  // =================================
  //  RENDER
  // =================================
  if (!editor) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-base-mid/40 bg-base-mid/5 px-1.5 py-1">
        <select
          value={toolbarState?.paragraphValue ?? "paragraph"}
          onChange={(event) => {
            const selected = event.target.value;
            if (selected === "paragraph") {
              editor.chain().focus().setParagraph().run();
            } else {
              editor
                .chain()
                .focus()
                .setHeading({ level: Number(selected) as 1 | 2 | 3 })
                .run();
            }
          }}
          className="h-7 shrink-0 rounded-md border border-base-mid/40 bg-white px-1 text-xs text-base-dark dark:bg-base-dark dark:text-base-light"
        >
          {PARAGRAPH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="mx-0.5 h-5 w-px shrink-0 bg-base-mid/25" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Grassetto"
          className={toolbarButtonClass(Boolean(toolbarState?.bold))}
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Corsivo"
          className={toolbarButtonClass(Boolean(toolbarState?.italic))}
        >
          <Italic size={14} />
        </button>

        <span className="mx-0.5 h-5 w-px shrink-0 bg-base-mid/25" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Elenco puntato"
          className={toolbarButtonClass(Boolean(toolbarState?.bulletList))}
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Elenco numerato"
          className={toolbarButtonClass(Boolean(toolbarState?.orderedList))}
        >
          <ListOrdered size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Citazione"
          className={toolbarButtonClass(Boolean(toolbarState?.blockquote))}
        >
          <Quote size={14} />
        </button>

        <span className="mx-0.5 h-5 w-px shrink-0 bg-base-mid/25" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          aria-label="Allinea a sinistra"
          className={toolbarButtonClass(Boolean(toolbarState?.alignLeft))}
        >
          <AlignLeft size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          aria-label="Allinea al centro"
          className={toolbarButtonClass(Boolean(toolbarState?.alignCenter))}
        >
          <AlignCenter size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          aria-label="Allinea a destra"
          className={toolbarButtonClass(Boolean(toolbarState?.alignRight))}
        >
          <AlignRight size={14} />
        </button>

        <span className="mx-0.5 h-5 w-px shrink-0 bg-base-mid/25" />

        <button
          type="button"
          onClick={handleLinkToggle}
          aria-label={toolbarState?.link ? "Rimuovi link" : "Inserisci link"}
          className={toolbarButtonClass(Boolean(toolbarState?.link))}
        >
          {toolbarState?.link ? <Link2Off size={14} /> : <Link2 size={14} />}
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
