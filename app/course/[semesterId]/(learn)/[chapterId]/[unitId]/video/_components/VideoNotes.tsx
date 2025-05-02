"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useState } from 'react';
import { NoteContent } from '@/types/note';
import { toast } from 'sonner';
import { getOrCreateNote, updateNote } from '@/app/actions/notesActions';

interface VideoNotesProps {
  chapterId: string;
  unitId: string;
  getCurrentTimestamp: () => number;
}

export default function VideoNotes({ chapterId, unitId, getCurrentTimestamp }: VideoNotesProps) {
  const [note, setNote] = useState<{ id: string; content: NoteContent } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
        types: ['heading', 'paragraph'],
      }),
    ],
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: ''
            }
          ]
        }
      ]
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[100px] h-full',
      },
    },
    onUpdate: ({ editor }) => {
      // Debounced save
      const timeoutId = setTimeout(async () => {
        if (note) {
          await saveNote(editor.getJSON());
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    },
  });

  useEffect(() => {
    let isMounted = true;

    const fetchNote = async () => {
      try {
        const initialTimestamp = getCurrentTimestamp ? getCurrentTimestamp() : 0;
        const result = await getOrCreateNote(chapterId, unitId, initialTimestamp);

        if (!isMounted) return;

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.note) {
          setNote(result.note);
          if (editor) {
            const currentContent = editor.getJSON();
            if (JSON.stringify(currentContent) !== JSON.stringify(result.note.content)) {
              editor.commands.setContent(result.note.content, false);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching/creating note:', error);
          toast.error('Failed to load notes');
        }
      }
    };

    if (editor) {
      fetchNote();
    }

    return () => {
      isMounted = false;
    };
  }, [chapterId, unitId, editor, getCurrentTimestamp]);

  const saveNote = async (content: any) => {
    if (!note?.id || !getCurrentTimestamp) return;

    try {
      setIsSaving(true);
      const currentTimestamp = getCurrentTimestamp();
      const result = await updateNote(note.id, content, currentTimestamp);
      
      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-secondary font-neima text-lg">Notes</h3>
        <div className="flex items-center gap-2">
          <div className="text-xs text-white/40">
            {isSaving ? 'Saving...' : 'All changes saved'}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded hover:bg-white/10 ${editor.isActive('bold') ? 'text-secondary' : 'text-white'}`}
              title="Bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded hover:bg-white/10 ${editor.isActive('italic') ? 'text-secondary' : 'text-white'}`}
              title="Italic"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="4" x2="10" y2="4"></line>
                <line x1="14" y1="20" x2="5" y2="20"></line>
                <line x1="15" y1="4" x2="9" y2="20"></line>
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1 rounded hover:bg-white/10 ${editor.isActive('underline') ? 'text-secondary' : 'text-white'}`}
              title="Underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                <line x1="4" y1="21" x2="20" y2="21"></line>
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1 rounded hover:bg-white/10 ${editor.isActive('bulletList') ? 'text-secondary' : 'text-white'}`}
              title="Bullet List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
} 