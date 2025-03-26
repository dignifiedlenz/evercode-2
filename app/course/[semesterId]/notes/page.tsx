"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  unitId: string;
  chapterId: string;
}

export default function NotesPage() {
  const pathname = usePathname();
  const [semesterId, setSemesterId] = useState<string>("");
  const [currentSemester, setCurrentSemester] = useState<number>(1);

  // Extract semesterId from URL path
  useEffect(() => {
    const pathSegments = pathname.split('/');
    const sid = pathSegments[2] || "";
    setSemesterId(sid);
    setCurrentSemester(parseInt(sid.replace('semester-', ''), 10) || 1);
  }, [pathname]);
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isCreating, setIsCreating] = useState(false);
  
  // Mock notes - in a real app, these would come from a database
  useEffect(() => {
    // Simulate loading notes from storage
    const mockNotes: Note[] = [
      {
        id: "note-1",
        title: "Important Concepts from Chapter 1",
        content: "The key insights from today's lecture include...\n\n- Point one about the topic\n- Another important concept\n- Questions to follow up on later",
        date: "2023-11-10",
        unitId: "unit-1",
        chapterId: "chapter-1"
      },
      {
        id: "note-2",
        title: "Study Group Notes",
        content: "During our study group session, we discussed...\n\nTasks to complete:\n1. Review chapter materials\n2. Complete practice exercises\n3. Prepare questions for next session",
        date: "2023-11-12",
        unitId: "unit-2",
        chapterId: "chapter-1"
      }
    ];
    
    setNotes(mockNotes);
    
    if (mockNotes.length > 0) {
      setActiveNote(mockNotes[0]);
    }
  }, [currentSemester]);
  
  const handleCreateNote = () => {
    if (newNote.title.trim() === "" || newNote.content.trim() === "") {
      return;
    }
    
    const newNoteObj: Note = {
      id: `note-${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      date: new Date().toISOString().split('T')[0],
      unitId: "unit-1",
      chapterId: "chapter-1"
    };
    
    setNotes(prev => [newNoteObj, ...prev]);
    setActiveNote(newNoteObj);
    setNewNote({ title: "", content: "" });
    setIsCreating(false);
  };
  
  return (
    <div className="p-4 md:p-8 backdrop-blur-sm bg-black/30 rounded-lg max-w-7xl mx-auto mt-16">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-morion text-white">My Notes</h1>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-secondary/80 hover:bg-secondary text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </button>
          </div>
          
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
            {notes.map(note => (
              <div 
                key={note.id}
                onClick={() => {
                  setActiveNote(note);
                  setIsCreating(false);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeNote?.id === note.id 
                    ? "bg-white/10 border border-secondary/50" 
                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              >
                <h3 className="text-white font-medium truncate">{note.title}</h3>
                <p className="text-white/60 text-sm truncate">{note.content.substring(0, 50)}...</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-white/40">{note.date}</span>
                  <span className="text-xs text-secondary">Chapter {note.chapterId.split('-')[1]}</span>
                </div>
              </div>
            ))}
            
            {notes.length === 0 && !isCreating && (
              <div className="text-center py-8 text-white/50">
                <p>No notes yet. Create your first note!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Note Content */}
        <div className="md:w-2/3 lg:w-3/4 bg-white/5 rounded-lg border border-white/10 p-4 md:p-6">
          {isCreating ? (
            <div className="space-y-4">
              <h2 className="text-2xl text-white font-medium">Create New Note</h2>
              
              <div>
                <input
                  type="text"
                  placeholder="Note Title"
                  value={newNote.title}
                  onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white placeholder-white/40 focus:outline-none focus:border-secondary/50"
                />
              </div>
              
              <div>
                <textarea
                  placeholder="Write your note here..."
                  value={newNote.content}
                  onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-secondary/50 min-h-[300px]"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateNote}
                  className="px-4 py-2 bg-secondary/80 hover:bg-secondary rounded-lg text-white"
                >
                  Save Note
                </button>
              </div>
            </div>
          ) : activeNote ? (
            <div>
              <h2 className="text-2xl text-white font-medium mb-2">{activeNote.title}</h2>
              <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
                <span>{activeNote.date}</span>
                <span>•</span>
                <span>Chapter {activeNote.chapterId.split('-')[1]}, Unit {activeNote.unitId.split('-')[1]}</span>
              </div>
              
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-white/80">{activeNote.content}</pre>
              </div>
              
              <div className="flex justify-end mt-8">
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Note
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-white/50">
              <p>Select a note or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 