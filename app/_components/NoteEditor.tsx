
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

// Adjust this to match your TipTap JSON structure

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NoteContent {
  type: string;
  content?: Array<NoteContent>;
  [key: string]: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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
    ],
    content: editorContent || '<p>Write your notes here...</p>',
    onUpdate: ({ editor }) => {
      // Update local state only
      const json = editor.getJSON() as NoteContent;
      setEditorContent(json);
      // Pass changes up to the parent so it can maintain local state as well
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


  return (
    <div>
    
      {/* Editor Content */}
      <EditorContent editor={editor} className="p-4 min-h-[200px]" />
    </div>
  );
}


/*
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
      

      
      <EditorContent editor={editor} className="p-4 min-h-[500px]" />
    </div>
  );
}

*/