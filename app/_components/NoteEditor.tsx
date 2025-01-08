// components/NoteEditor.tsx

// components/NoteEditor.tsx

"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { NoteContent } from "@/types/note"; // Import the defined type

interface NoteEditorProps {
  initialContent: NoteContent | null;
  onSave: (content: NoteContent) => Promise<void>;
}

export default function NoteEditor({ initialContent, onSave }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings as they're not needed
        bulletList: false, // Disable default bulletList if customizing
        orderedList: false, // Disable orderedList
        listItem: false, // Disable default listItem
      }),
      Bold,
      Italic,
      Underline,
      BulletList,
      ListItem,
    ],
    content: initialContent ? initialContent : '<p>Write your notes here...</p>',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onSave(json as NoteContent);
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
  

  return (
    <div className="">
      

      {/* Editor Content */}
      <EditorContent editor={editor} className="p-4 min-h-[500px]" />
    </div>
  );
}


/*"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";

interface NoteEditorProps {
  initialContent: any; // TipTap's JSON format
  onSave: (content: any) => void;
}

export default function NoteEditor({ initialContent, onSave }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Bold, Italic],
    content: initialContent || '<p>Write your notes here...</p>',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onSave(json);
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

  return (
    <div>
      <div className="mb-2">
       
      </div>
      <EditorContent editor={editor} className="prose h-[80vh]" />
    </div>
  );
} */
