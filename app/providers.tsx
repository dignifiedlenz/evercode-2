// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { ProgressProvider } from "@/context/ProgressContext";
import { NotesProvider } from "@/context/NotesContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProgressProvider>
        <NotesProvider>
      {children}
      </NotesProvider>
      </ProgressProvider>
    </SessionProvider>
  );
}
