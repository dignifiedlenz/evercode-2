import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import "./globals.css";
import { ChronologicalModeProvider } from './context/ChronologicalModeContext';
import { AuthProvider } from '@/context/AuthContext';
import UserMenu from "./_components/UserMenu";
import Toaster from './_components/Toaster';
import { ViewTransitions } from 'next-view-transitions';
import ScreenSizeIndicator from './_components/ScreenSizeIndicator';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Evermode',
  description: 'Learn philosophy through interactive courses',
  icons: {
    icon: '/evermode.ico'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className="h-full bg-black">
        <body className="h-full bg-transparent">
          <AuthProvider>
            <ChronologicalModeProvider>
              <Toaster />
              <div className="relative min-h-screen w-full">
                {/* User Menu (Top Right) */}
                <div className="fixed z-50 top-5 right-5">
                  <UserMenu />
                </div>
                
                {children}
                
                {/* Screen Size Indicator */}
                <ScreenSizeIndicator />
              </div>
            </ChronologicalModeProvider>
          </AuthProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
