"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import LoadingBar from "./LoadingBar";
import UserMenu from "./UserMenu";
import { Suspense } from "react";

function LoadingBarWrapper() {
  return (
    <Suspense fallback={null}>
      <LoadingBar />
    </Suspense>
  );
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <LoadingBarWrapper />
      <UserMenu />
      {children}
      <Toaster position="bottom-right" />
    </SessionProvider>
  );
} 