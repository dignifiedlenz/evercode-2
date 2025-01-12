// src/context/ProgressContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of your context
interface ProgressContextType {
  completedUnits: Record<string, string[]>;
  markUnitAsCompleted: (chapterId: string, unitId: string) => Promise<void>;
}

// Define the props interface
interface ProgressProviderProps {
  children: ReactNode;
}

// Create the context with a default value
const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// Provider component with explicit props interface
export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [completedUnits, setCompletedUnits] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Fetch initial progress from API
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/progress');
        if (res.ok) {
          const data = await res.json();
          setCompletedUnits(data.completedUnits);
          console.log('Fetched initial progress:', data.completedUnits);
        } else {
          console.error('Failed to fetch progress:', res.statusText);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };
    fetchProgress();
  }, []);

  const markUnitAsCompleted = async (chapterId: string, unitId: string) => {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, unitId }),
      });

      if (res.ok) {
        setCompletedUnits(prev => {
          const chapterUnits = prev[chapterId] || [];
          if (!chapterUnits.includes(unitId)) {
            const updated = { ...prev, [chapterId]: [...chapterUnits, unitId] };
            console.log(`Unit ${unitId} marked as completed in chapter ${chapterId}`);
            return updated;
          }
          return prev;
        });
      } else {
        const errorData = await res.json();
        console.error('Failed to mark unit as completed:', errorData.message);
      }
    } catch (error) {
      console.error('Error marking unit as completed:', error);
    }
  };

  return (
    <ProgressContext.Provider value={{ completedUnits, markUnitAsCompleted }}>
      {children}
    </ProgressContext.Provider>
  );
};

// Custom hook for consuming the context
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};
