import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List } from 'lucide-react'
import { NoteContent } from '@/types/note'
import { useEffect, useState, useCallback } from 'react'
import { updateNote } from '@/app/actions/notesActions'
import { toast } from 'sonner'

interface EditorProps {
  noteId: string
  content: NoteContent
}

export default function Editor({ noteId, content }: EditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<NoteContent | null>(null);

  const saveNote = useCallback(async (currentContent: NoteContent) => {
    if (JSON.stringify(currentContent) === JSON.stringify(lastSavedContent)) {
      return;
    }
    
    setIsSaving(true);
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const result = await updateNote(noteId, currentContent, timestamp);
      if (result.error) {
        throw new Error(result.error);
      }
      setLastSavedContent(currentContent);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [noteId, lastSavedContent]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          HTMLAttributes: { class: 'mb-[1px]' },
        },
        paragraph: {
          HTMLAttributes: { class: 'mb-[1px]' },
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert max-w-none h-full focus:outline-none text-white/90',
      },
    },
    onUpdate: ({ editor }) => {
      const currentContent = editor.getJSON() as NoteContent;
      const timeoutId = setTimeout(() => {
        saveNote(currentContent);
      }, 1500);

      return () => clearTimeout(timeoutId);
    },
  })

  useEffect(() => {
    if (editor && content) {
      const isSame = JSON.stringify(editor.getJSON()) === JSON.stringify(content);
      if (!isSame) {
        editor.commands.setContent(content, false);
        setLastSavedContent(content);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (content) {
      setLastSavedContent(content);
    }
  }, [content]);

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded transition-colors ${editor.isActive('bold') ? 'bg-white/20 text-secondary' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded transition-colors ${editor.isActive('italic') ? 'bg-white/20 text-secondary' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-white/20 text-secondary' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 py-1.5 text-sm text-white/60 rounded-md">
          {isSaving ? 'Saving...' : 'All changes saved'}
        </div>
      </div>
      <div className="flex-1 min-h-[300px] border border-secondary rounded-lg overflow-hidden p-4">
        <EditorContent 
          editor={editor} 
          className="h-full cursor-text bg-transparent"
        />
      </div>
    </div>
  )
} 