'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface ChronologicalModeContextType {
  isChronologicalMode: boolean;
  toggleChronologicalMode: () => void;
}

const ChronologicalModeContext = createContext<ChronologicalModeContextType | undefined>(undefined);

export function ChronologicalModeProvider({ children }: { children: React.ReactNode }) {
  const [isChronologicalMode, setIsChronologicalMode] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('chronologicalMode');
    if (stored !== null) {
      setIsChronologicalMode(stored === 'true');
    }
  }, []);

  const toggleChronologicalMode = () => {
    setIsChronologicalMode(prev => {
      const newValue = !prev;
      localStorage.setItem('chronologicalMode', String(newValue));
      return newValue;
    });
  };

  return (
    <ChronologicalModeContext.Provider value={{ isChronologicalMode, toggleChronologicalMode }}>
      {children}
    </ChronologicalModeContext.Provider>
  );
}

export function useChronologicalMode() {
  const context = useContext(ChronologicalModeContext);
  if (context === undefined) {
    throw new Error('useChronologicalMode must be used within a ChronologicalModeProvider');
  }
  return context;
} 