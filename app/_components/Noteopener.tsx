// components/Sidebar.tsx

"use client";

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
