"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface BioEditorProps {
  defaultValue?: string | null;
}

export function BioEditor({ defaultValue }: BioEditorProps) {
  const [html, setHtml] = useState(defaultValue ?? "");

  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue ?? "",
    immediatelyRender: false,
    onUpdate({ editor }) {
      setHtml(editor.getHTML());
    },
  });

  const monoLabel: React.CSSProperties = {
    fontSize: "var(--text-label)",
    letterSpacing: "var(--tracking-nav)",
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().toggleBold().run();
          }}
          className={`font-mono uppercase border px-2 py-0.5 transition-colors font-bold ${
            editor?.isActive("bold")
              ? "border-ink bg-ink text-paper"
              : "border-rule text-ghost-strong hover:border-ink hover:text-ink"
          }`}
          style={monoLabel}
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().toggleItalic().run();
          }}
          className={`font-mono uppercase border px-2 py-0.5 transition-colors italic ${
            editor?.isActive("italic")
              ? "border-ink bg-ink text-paper"
              : "border-rule text-ghost-strong hover:border-ink hover:text-ink"
          }`}
          style={monoLabel}
        >
          I
        </button>
        <span
          className="font-mono text-ghost-mid ml-2"
          style={{ fontSize: "var(--text-date)" }}
        >
          Enter = new paragraph
        </span>
      </div>

      <EditorContent
        editor={editor}
        className="bio-editor w-full border border-rule bg-paper text-ink px-4 py-2 outline-none focus-within:border-ink min-h-[12rem] cursor-text"
        style={{
          fontSize: "var(--text-body)",
          lineHeight: "var(--text-body--line-height)",
        }}
      />

      <input type="hidden" name="bio" value={html} readOnly />
    </div>
  );
}
