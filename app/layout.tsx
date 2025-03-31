"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import UserMenu from "./_components/UserMenu";
import LoadingBar from "./_components/LoadingBar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-black">
      <body className={inter.className}>
        <SessionProvider>
          <LoadingBar />
          <UserMenu />
          {children}
          <Toaster position="bottom-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
