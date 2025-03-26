// components/NoteTakingSheet.tsx

"use client";

import React, { useState, useEffect } from "react";
import NoteEditor from "./NoteEditor";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

// ✅ Import the shared NoteContent type instead
import { NoteContent } from "@/types/note";

interface NoteTakingSheetProps {
  note: NoteContent | null; // use the shared type
  setNote: React.Dispatch<React.SetStateAction<NoteContent | null>>;
}

export default function NoteTakingSheet({ note, setNote }: NoteTakingSheetProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/notes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setNote(data.content);
        } else {
          console.error("Failed to fetch note.");
          toast.error("Failed to fetch note.");
          setNote(null);
        }
      } catch (error) {
        console.error("Failed to fetch note:", error);
        toast.error("An error occurred while fetching the note.");
        setNote(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [setNote]);

  return (
    <div className="flex flex-col h-full text-white">
      <DialogTitle>
        <VisuallyHidden>Notes Sheet</VisuallyHidden>
      </DialogTitle>
      <div className="p-4 h-full flex flex-col">
        <h2 className="text-3xl text-secondary font-custom1 mb-4">Notes</h2>
        <ScrollArea className="h-full">
          <div className="flex-grow overflow-y-auto p-4">
            {isLoading ? (
              <p>Fetching your notes...</p>
            ) : (
              <NoteEditor
                initialContent={note}
                onLocalChange={(updatedContent) => {
                  setNote(updatedContent);
                }}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}


/*
"use client";

import React, { useState, useEffect } from "react";
import NoteEditor from "./NoteEditor";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "react-hot-toast";
import { NoteContent } from "@/types/note"; // Import the defined type

interface NoteTakingSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NoteTakingSheet({ isOpen, onClose }: NoteTakingSheetProps) {
  const [note, setNote] = useState<NoteContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/notes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setNote(data.content);
        } else {
          console.error("Failed to fetch note.");
          toast.error("Failed to fetch note.");
          setNote(null);
        }
      } catch (error) {
        console.error("Failed to fetch note:", error);
        toast.error("An error occurred while fetching the note.");
        setNote(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchNote();
    }
  }, [isOpen]);

  const saveNote = async (content: NoteContent) => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Notes saved successfully!", data);
        setNote(data.content);
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
  };

  const handleClose = async () => {
    if (note) {
      await saveNote(note);
    }
    onClose();
  };

  return (
    <div>
      <DialogTitle>
        <VisuallyHidden>Notes Sheet</VisuallyHidden>
      </DialogTitle>
      <div className="p-4 h-full flex flex-col">
        <h2 className="text-3xl text-secondary font-custom1 mb-4">Notes</h2>
        <div className="flex-grow">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <NoteEditor initialContent={note} onSave={saveNote} />
          )}
        </div>
        
        <button
          className="mt-4 w-full text-white p-2 self-end rounded hover:bg-secondary-foreground transition-colors"
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
*/