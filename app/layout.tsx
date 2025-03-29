"use client";

import { AnimatePresence } from "framer-motion";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={inter.className}>
        <SessionProvider>
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </SessionProvider>
      </body>
    </html>
  );
}
