// app/notes/page.tsx

"use client";

import React, { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet"; // Adjust the import path based on your project structure
import NoteTakingSheet from "@/app/_components/NoteTakingSheet";

export default function NotesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <button
        onClick={() => setIsSheetOpen(true)}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
      >
        Open Notes
      </button>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {/* If you don't want an overlay, omit the SheetOverlay component */}
        {/* <SheetOverlay className="bg-black bg-opacity-85" /> */}
        <SheetContent side="right" className="w-[30%] bg-white p-4">
          <NoteTakingSheet
            isOpen={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
