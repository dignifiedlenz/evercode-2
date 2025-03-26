"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { NoteContent } from "@/types/note";
import { EditorContent } from "@tiptap/react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import TextAlign from "@tiptap/extension-text-align";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Note {
  id: string;
  title: string;
  content: NoteContent;
  chapterId: string;
  unitId: string;
  timestamp: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const chapterId = searchParams.get("chapter");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const fetchNotes = async () => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/notes", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch notes");
          }

          const data = await response.json();
          
          if (!data || !Array.isArray(data.notes)) {
            throw new Error("Invalid response format");
          }

          // Process notes to ensure content is properly parsed
          const processedNotes = data.notes.map((note: any) => {
            // Make sure content is properly parsed as a JSON object
            let parsedContent;
            if (typeof note.content === 'string') {
              try {
                parsedContent = JSON.parse(note.content);
              } catch (e) {
                console.error(`Error parsing note content for ID ${note.id}:`, e);
                // Fallback to default empty content
                parsedContent = {
                  type: "doc",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: "Error loading note content"
                        }
                      ]
                    }
                  ]
                };
              }
            } else {
              parsedContent = note.content;
            }

            return {
              ...note,
              content: parsedContent
            };
          });

          setNotes(processedNotes);
        } catch (error) {
          console.error("Failed to fetch notes:", error);
          toast.error(error instanceof Error ? error.message : "An error occurred while fetching notes");
          setNotes([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchNotes();
    }
  }, [status, router, session]);

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
    content: selectedNote ? selectedNote.content : {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Select a note to view its content"
            }
          ]
        }
      ]
    },
    editable: false,
  });

  // Update editor content when selectedNote changes
  useEffect(() => {
    if (editor && selectedNote) {
      editor.commands.setContent(selectedNote.content);
    }
  }, [editor, selectedNote]);

  // Group notes by chapter
  const notesByChapter = notes.reduce((acc, note) => {
    if (!acc[note.chapterId]) {
      acc[note.chapterId] = [];
    }
    acc[note.chapterId].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Notes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Notes List */}
          <div className="md:col-span-1">
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Chapters</h2>
              {isLoading ? (
                <div className="text-zinc-400">Loading notes...</div>
              ) : notes.length === 0 ? (
                <div className="text-zinc-400">No notes yet. Start taking notes while watching videos!</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(notesByChapter).map(([chapterId, chapterNotes]) => (
                    <div key={chapterId} className="space-y-2">
                      <h3 className="text-lg font-medium text-secondary">
                        Chapter {chapterId}
                      </h3>
                      <div className="space-y-2">
                        {chapterNotes.map((note) => (
                          <button
                            key={note.id}
                            onClick={() => setSelectedNote(note)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              selectedNote?.id === note.id
                                ? "bg-secondary/20 text-secondary"
                                : "hover:bg-zinc-800"
                            }`}
                          >
                            <div className="font-medium">{note.title}</div>
                            <div className="text-sm text-zinc-400">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note Content */}
          <div className="md:col-span-2">
            {selectedNote ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 rounded-lg p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                  <div className="text-sm text-zinc-400">
                    {new Date(selectedNote.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {editor && <EditorContent editor={editor} className="prose prose-invert max-w-none" />}
                {selectedNote.timestamp && (
                  <div className="mt-4 text-sm text-zinc-400">
                    Created at video timestamp: {Math.floor(selectedNote.timestamp / 60)}:{(selectedNote.timestamp % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-zinc-900/50 rounded-lg p-6 text-center text-zinc-400">
                {isLoading ? "Loading..." : "Select a note to view its content"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 