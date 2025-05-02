"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Editor from "@/app/components/tiptap/Editor";
import { getNotesByChapter } from "@/app/actions/notesActions";
import { NoteContent } from "@/types/note";
import courseData from "@/app/_components/(semester1)/courseData";

interface Note {
  id: string;
  chapter_id: string;
  unit_id: string;
  content: NoteContent;
  timestamp: number;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const pathname = usePathname();
  const [semesterId, setSemesterId] = useState<string>("");
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract semesterId from URL path
  useEffect(() => {
    const pathSegments = pathname.split('/');
    const sid = pathSegments[2] || "";
    setSemesterId(sid);
    setCurrentSemester(parseInt(sid.replace('semester-', ''), 10) || 1);
  }, [pathname]);

  // Fetch notes for the current semester
  useEffect(() => {
    async function fetchNotes() {
      try {
        setIsLoading(true);
        const semester = courseData.find(sem => sem.id === semesterId);
        if (!semester) {
          setError('Semester not found');
          return;
        }

        // Fetch notes for each chapter in the semester
        const allNotes: Note[] = [];
        for (const chapter of semester.chapters) {
          const { notes: chapterNotes, error } = await getNotesByChapter(chapter.id);
          if (error) {
            console.error(`Error fetching notes for chapter ${chapter.id}:`, error);
            continue;
          }
          if (chapterNotes) {
            allNotes.push(...chapterNotes);
          }
        }

        setNotes(allNotes);
        if (allNotes.length > 0) {
          setActiveNote(allNotes[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      } finally {
        setIsLoading(false);
      }
    }

    if (semesterId) {
      fetchNotes();
    }
  }, [semesterId]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 backdrop-blur-sm bg-black/30 rounded-lg max-w-7xl mx-auto mt-24">
        <div className="text-center text-white/50">Loading notes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 backdrop-blur-sm bg-black/30 rounded-lg max-w-7xl mx-auto mt-24">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 backdrop-blur-sm bg-black/30 rounded-lg max-w-7xl mx-auto mt-24">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-morion text-white">My Notes</h1>
          </div>
          
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
            {notes.map(note => {
              const chapter = courseData
                .flatMap(sem => sem.chapters)
                .find(ch => ch.id === note.chapter_id);
              const chapterTitle = chapter?.title || 'Untitled Chapter';
              
              return (
                <div 
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeNote?.id === note.id 
                      ? "bg-white/10 border border-secondary/50" 
                      : "bg-white/5 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <h3 className="text-white font-medium truncate">
                    {chapterTitle}
                  </h3>
                  <p className="text-white/60 text-sm truncate">
                    {note.content.content?.[0]?.content?.[0]?.text || 'Empty note'}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-white/40">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {notes.length === 0 && (
              <div className="text-center py-8 text-white/50">
                <p>No notes yet. Create your first note!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Note Content */}
        <div className="md:w-2/3 lg:w-3/4 bg-white/5 rounded-lg border border-white/10 p-4 md:p-6">
          {activeNote ? (
            <div className="h-full">
              <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
                <span>Last updated: {new Date(activeNote.updated_at).toLocaleString()}</span>
              </div>
              
              <Editor 
                key={activeNote.id}
                noteId={activeNote.id}
                content={activeNote.content}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-white/50">
              <p>Select a note to view or edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 