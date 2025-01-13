// components/Sidebar.tsx

"use client";

import React, { useState, useContext } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet"; // Adjust the import path based on your project structure
import NoteTakingSheet from "../../../_components/NoteTakingSheet";
import { NoteContent } from "@/types/note";
import { QuillIcon } from "../../../_components/_media/quillIcon";
import { toast } from "react-hot-toast";
import { NotesContext } from "@/context/NotesContext"; // Import the context

export default function Notes() {
  const { isNotesOpen, setIsNotesOpen } = useContext(NotesContext); // Consume the context
  const [noteContent, setNoteContent] = useState<NoteContent | null>(null);

  // Called whenever the user opens or closes the sheet
  const handleSheetOpenChange = async (open: boolean) => {
    // Update the context state
    setIsNotesOpen(open);

    // If the sheet is closing, save the note
    if (!open && noteContent) {
      try {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: noteContent }),
          credentials: "include",
        });

        if (response.ok) {
          toast.success("Notes saved successfully!");
        } else {
          const errorData = await response.json();
          console.error("Failed to save note:", errorData.error);
          toast.error(errorData.error || "Failed to save note.");
        }
      } catch (error) {
        console.error("Failed to save note:", error);
        toast.error("An error occurred while saving the note.");
      }
    }
  };

  return (
    <Sheet open={isNotesOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <button
          className="absolute opacity-60 hover:opacity-100 bottom-8 right-8 z-50 hover:rotate-12 transition-all"
          aria-label="Open Notes"
        >
          <QuillIcon />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-black text-white font-custom2 w-full min-w-[35vw]">
        {/* Pass down noteContent and a setter so child can update parent's state */}
        <NoteTakingSheet note={noteContent} setNote={setNoteContent} />
      </SheetContent>
    </Sheet>
  );
}
