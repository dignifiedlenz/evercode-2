"use client";

import { useState } from "react";
import { BookIcon } from "./_media/bookIcon";
import Link from "next/link";
import { Logo } from "./_media/logo";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"; // Adjust the import based on your setup

export default function Sidebar() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <div className="h-screen min-w-28 flex flex-col items-center justify-between p-5 gap-y-6">
            <Link href="/" className="opacity-65 hover:opacity-100">
                <Logo />
            </Link>

            <button
                onClick={() => setIsSheetOpen(true)}
                className="mb-4 p-2 opacity-65 hover:bg-opacity-100"
            >
                <BookIcon />
            </button>

            {/* Sheet without overlay */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent
                    side="left"
                    className="bg-black min-w-[40vw] h-full"
                >
                    <SheetHeader>
                        <SheetTitle>Information</SheetTitle>
                        <SheetDescription>
                            Add any description or details here.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4">
                        {/* Render your information here */}
                        <p>This is the information displayed in the sheet.</p>
                    </div>
                </SheetContent>
            </Sheet>

            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-fit text-sm font-custom2 text-white hover:bg-secondary-foreground hover:text-black px-1 py-1 rounded"
            >
                Sign Out
            </button>
        </div>
    );
}
