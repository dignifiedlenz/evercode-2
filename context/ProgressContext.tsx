// src/context/ProgressContext.tsx
"use client";

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
        
        // Handle auth errors gracefully without causing redirects
        if (res.status === 401) {
          console.log('Auth error in progress API - not redirecting');
          return;
        }
        
        if (res.ok) {
          const textData = await res.text();
          
          // Skip processing if response is empty
          if (!textData) {
            console.log('Empty response from progress API');
            return;
          }
          
          try {
            const data = JSON.parse(textData);
            setCompletedUnits(data.completedUnits || {});
            console.log('Fetched initial progress:', data.completedUnits);
          } catch (parseError) {
            console.error('Error parsing progress JSON:', parseError, 'Response:', textData);
          }
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
        const textData = await res.text();
        
        // Skip processing if response is empty
        if (!textData) {
          console.log('Empty response from progress update API');
          return;
        }
        
        try {
          const data = JSON.parse(textData);
          // Update local state to reflect the backend changes
          setCompletedUnits(prev => {
            const newState = { ...prev };
            if (!newState[chapterId]) {
              newState[chapterId] = [];
            }
            if (!newState[chapterId].includes(unitId)) {
              newState[chapterId] = [...newState[chapterId], unitId];
            }
            return newState;
          });
          console.log('Updated progress:', data);
        } catch (parseError) {
          console.error('Error parsing progress update JSON:', parseError, 'Response:', textData);
        }
      } else {
        console.error('Failed to update progress:', res.statusText);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
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
