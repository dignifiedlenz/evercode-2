// src/components/Sidebar.tsx

"use client";

import { useState } from "react";
import { BookIcon } from "./_media/bookIcon";
import Link from "next/link";
import { Logo } from "./_media/logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"; // Ensure correct import path
import { CourseMap } from "./Coursemap";
import { Semester, CompletedUnits } from "@/types/course";

interface SidebarProps {
  courseData: Semester[];
  completedUnits: CompletedUnits;
}

export default function Sidebar({  }: SidebarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="fixed h-screen min-w-28 flex flex-col items-center justify-between p-5 gap-y-6">
      <Link href="/" className="opacity-65 hover:opacity-100">
        <Logo />
      </Link>
      <div className="opacity-65 hover:bg-opacity-100">
        <button
          onClick={() => setIsSheetOpen(true)}
          className="mb-4 p-2"
        >
          <BookIcon />
        </button>
      </div>

      {/* Sheet without overlay */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="left"
          className="bg-black min-w-screen h-full"
        >
          <SheetHeader>
            <SheetTitle className="text-3xl font-custom1 text-secondary">COURSE MAP</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <CourseMap/>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
