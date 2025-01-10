"use client";

import { useState } from "react";
import { BookIcon } from "./_media/bookIcon";
import Link from "next/link";
import { Logo } from "./_media/logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"; // Adjust the import based on your setup
import { CourseMap } from "./Coursemap";

export default function Sidebar() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <div className="h-screen min-w-28 flex flex-col items-center justify-between p-5 gap-y-6">
            <Link href="/" className="opacity-65 hover:opacity-100">
                <Logo />
            </Link>
            <div className="opacity-65 hover:bg-opacity-100">
            <button
                onClick={() => setIsSheetOpen(true)}
                className="mb-4 p-2 "
            >
                <BookIcon />
            </button>
            </div>

            {/* Sheet without overlay */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent
                    side="left"
                    className="bg-black min-w-[40vw] h-full"
                >
                    <SheetHeader>
                        <SheetTitle className="text-3xl font-custom1 text-secondary">COURSE MAP</SheetTitle>
                        <SheetDescription>
                           Coursemap available soon.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4">
                        <CourseMap/>
                    </div>
                </SheetContent>
            </Sheet>

        </div>
    );
}
