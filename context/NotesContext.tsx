// src/context/NotesContext.tsx

"use client";

import React, { createContext, useState, ReactNode } from "react";

// Define the shape of the context
interface NotesContextProps {
  isNotesOpen: boolean;
  setIsNotesOpen: (open: boolean) => void;
}

// Create the context with default values
export const NotesContext = createContext<NotesContextProps>({
  isNotesOpen: false,
  setIsNotesOpen: () => {},
});

// Create a provider component
export const NotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);

  return (
    <NotesContext.Provider value={{ isNotesOpen, setIsNotesOpen }}>
      {children}
    </NotesContext.Provider>
  );
};
