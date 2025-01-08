


// components/Sidebar.tsx

"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet"; // Adjust the import path based on your project structure
import NoteTakingSheet, { NoteContent } from "./NoteTakingSheet";
import { QuillIcon } from "./_media/quillIcon";
import { toast } from "react-hot-toast";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [noteContent, setNoteContent] = useState<NoteContent | null>(null);

  // Called whenever the user opens or closes the sheet
  const handleSheetOpenChange = async (open: boolean) => {
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

    setIsOpen(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <button
          className="fixed opacity-60 hover:opacity-100 bottom-8 right-8 z-50"
          aria-label="Open Notes"
        >
          <QuillIcon/>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-black text-white font-custom2 w-full min-w-[35vw]">
        

        {/* Pass down noteContent and a setter so child can update parent's state */}
        <NoteTakingSheet
          note={noteContent}
          setNote={setNoteContent}
        />
      </SheetContent>
    </Sheet>
  );
}

// components/Sidebar.tsx

/*"use client";

import React from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet"; // Adjust the import path based on your project structure
import NoteTakingSheet from "./NoteTakingSheet";
import { BookIcon } from "./_media/bookIcon";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Sidebar() {

  const [isOpen, setIsOpen] = useState<boolean>(false);


  const handleClose = () => setIsOpen(false);

  const { data: session, status } = useSession();

  // Show nothing while loading
  if (status === "loading") {
    return null;
  }

  // If not authenticated, optionally show a login prompt or nothing
  if (!session) {
    return null; // Or render a login button/link
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="fixed bottom-5 right-5  opacity-50 hover:opacity-100 z-50"
          aria-label="Open Notes"
        >
          <BookIcon />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="min-w-[30vw] border-secondary bg-black bg-opacity-50 text-white">
        
      <NoteTakingSheet isOpen={isOpen} onClose={handleClose} />
        
      </SheetContent>
    </Sheet>
  );
}
*/