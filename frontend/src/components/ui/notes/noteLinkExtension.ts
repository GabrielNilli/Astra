// =================================
//  IMPORTS
// =================================
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import {
  NoteLinkSuggestionList,
  type NoteLinkSuggestionItem,
  type NoteLinkSuggestionListHandle,
} from "./NoteLinkSuggestionList";

// =================================
//  FUNCTIONS
// =================================
// Digitando "[[" si apre un menu con le note dell'utente da collegare; il
// link salvato punta all'ID (sopravvive a un rename) e viene reso come normale
// <a href="/notes?note={id}">, lo stesso schema già usato per il deep-link
// dalle notifiche push: NoteCard intercetta il click e naviga via router.
export function createNoteLinkExtension(options: {
  getNotes: () => NoteLinkSuggestionItem[];
}) {
  const suggestion: Omit<SuggestionOptions, "editor"> = {
    char: "[[",
    items: ({ query }: { query: string }) => {
      const q = query.trim().toLowerCase();
      return options
        .getNotes()
        .filter((note) => !q || note.title.toLowerCase().includes(q))
        .slice(0, 8);
    },
    command: ({ editor, range, props }) => {
      const item = props as NoteLinkSuggestionItem;
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          { type: "noteLink", attrs: { noteId: item.id, title: item.title } },
          { type: "text", text: " " },
        ])
        .run();
    },
    render: () => {
      let component: ReactRenderer<NoteLinkSuggestionListHandle>;
      let popupEl: HTMLDivElement | null = null;

      function updatePosition(clientRect?: (() => DOMRect | null) | null) {
        const rect = clientRect?.();
        if (!rect || !popupEl) return;
        popupEl.style.left = `${rect.left}px`;
        popupEl.style.top = `${rect.bottom + 4}px`;
      }

      return {
        onStart: (props) => {
          component = new ReactRenderer(NoteLinkSuggestionList, {
            props,
            editor: props.editor,
          });
          popupEl = document.createElement("div");
          popupEl.style.position = "fixed";
          popupEl.style.zIndex = "9999";
          popupEl.appendChild(component.element);
          document.body.appendChild(popupEl);
          updatePosition(props.clientRect);
        },
        onUpdate: (props) => {
          component.updateProps(props);
          updatePosition(props.clientRect);
        },
        onKeyDown: (props) => {
          if (props.event.key === "Escape") {
            popupEl?.remove();
            return true;
          }
          return component.ref?.onKeyDown(props) ?? false;
        },
        onExit: () => {
          popupEl?.remove();
          component.destroy();
        },
      };
    },
  };

  return Node.create({
    name: "noteLink",
    group: "inline",
    inline: true,
    atom: true,
    selectable: false,

    addAttributes() {
      return {
        noteId: {
          default: null,
          parseHTML: (element) => {
            const match = (element.getAttribute("href") ?? "").match(/[?&]note=(\d+)/);
            return match ? Number(match[1]) : null;
          },
        },
        title: {
          default: "",
          parseHTML: (element) => element.textContent ?? "",
        },
      };
    },

    parseHTML() {
      return [{ tag: 'a[href^="/notes?note="]', priority: 60 }];
    },

    renderHTML({ node, HTMLAttributes }) {
      return [
        "a",
        mergeAttributes(HTMLAttributes, {
          href: `/notes?note=${node.attrs.noteId}`,
          class: "note-link",
        }),
        node.attrs.title || "Nota",
      ];
    },

    addOptions() {
      return { suggestion };
    },

    addProseMirrorPlugins() {
      return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
    },
  });
}
