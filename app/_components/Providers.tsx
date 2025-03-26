'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/context/ThemeContext";
import { TransitionProvider } from "@/context/TransitionContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <TransitionProvider>
          <ProgressProvider>
            {children}
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  fontSize: '16px',
                  fontFamily: 'var(--font-morion)',
                  padding: '12px 16px',
                  maxWidth: '400px',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ProgressProvider>
        </TransitionProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 