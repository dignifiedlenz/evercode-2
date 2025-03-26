'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  backgroundBrightness: number;
  setBackgroundBrightness: (value: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Map 0-100 slider value to 0-60% brightness
  const [backgroundBrightness, setBackgroundBrightness] = useState(35);

  useEffect(() => {
    // Convert slider value to actual brightness percentage (max 60%)
    const actualBrightness = (backgroundBrightness * 0.6).toFixed(1);
    document.documentElement.style.setProperty(
      '--background-brightness',
      `${actualBrightness}%`
    );
  }, [backgroundBrightness]);

  return (
    <ThemeContext.Provider value={{ backgroundBrightness, setBackgroundBrightness }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 