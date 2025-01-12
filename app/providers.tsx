// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { ProgressProvider } from "@/context/ProgressContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProgressProvider>
      {children}
      </ProgressProvider>
    </SessionProvider>
  );
}
