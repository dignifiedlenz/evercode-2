"use client"

import { BookIcon } from "./_media/bookIcon";
import Link from "next/link";
import { Logo } from "./_media/logo";
import { signOut } from "next-auth/react";





export default function Sidebar() {

    return ( 
        <div className="h-screen w-36 flex flex-col items-center justify-between bg-black p-5 gap-y-6 border-r-2 border-r-secondary">
            
            <Link href="/"
            className="opacity-65 hover:opacity-100"
            >
                <Logo/>
            </Link>
                   
            <button
                className="mb-4 p-2 opacity-65 hover:bg-opacity-100"
            >
                <BookIcon/>
            </button>
            
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-secondary text-black px-4 py-2 rounded self-end"
            >
                Sign Out
            </button>
            
                      
        </div>
     );
}
 
