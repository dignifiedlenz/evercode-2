// components/NoteEditor.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import TextAlign from "@tiptap/extension-text-align";
import { FaBold, FaItalic, FaUnderline, FaListUl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify } from "react-icons/fa";
import { NoteContent } from "@/types/note"; // Adjust the import path as needed

interface NoteEditorProps {
  initialContent: NoteContent | null;
  onLocalChange: (content: NoteContent) => void;
}

export default function NoteEditor({ initialContent, onLocalChange }: NoteEditorProps) {
  const [editorContent, setEditorContent] = useState<NoteContent | null>(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Bold,
      Italic,
      Underline,
      BulletList,
      ListItem,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: editorContent || {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              content: []
            }
          ]
        }
      ]
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() as NoteContent;
      setEditorContent(json);
      onLocalChange(json);
    },
  });

  useEffect(() => {
    if (initialContent && editor) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return null;
  }

  // Toolbar Button Component
  const MenuButton: React.FC<{ onClick: () => void; active: boolean; Icon: React.ComponentType<{ size?: number }> }> = ({ onClick, active, Icon }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-md hover:bg-zing-950 focus:outline-none  ${
        active ? "bg-gray-700" : ""
      }`}
      aria-pressed={active}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="min-h-96 rounded-md p-2 bg-zinc-950">
      {/* Toolbar */}
      <div className="flex space-x-2 mb-2">
        {/* Bold */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          Icon={FaBold}
          aria-label="Bold"
        />
        {/* Italic */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          Icon={FaItalic}
          aria-label="Italic"
        />
        {/* Underline */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          Icon={FaUnderline}
          aria-label="Underline"
        />
        {/* Bullet List */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          Icon={FaListUl}
          aria-label="Bullet List"
        />
        {/* Text Align Left */}
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          Icon={FaAlignLeft}
          aria-label="Align Left"
        />
        {/* Text Align Center */}
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          Icon={FaAlignCenter}
          aria-label="Align Center"
        />
        {/* Text Align Right */}
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          Icon={FaAlignRight}
          aria-label="Align Right"
        />
        {/* Text Align Justify */}
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          Icon={FaAlignJustify}
          aria-label="Justify"
        />
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="min-h-96 prose prose-invert focus:outline-none" />
    </div>
  );
}
