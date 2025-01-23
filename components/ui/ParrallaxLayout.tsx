"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useMotionValue, MotionValue } from "framer-motion";

// 1) Define the context interface
interface ParallaxContextValue {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

// 2) Create the context with a default value of undefined
const ParallaxContext = createContext<ParallaxContextValue | undefined>(undefined);

// 3) Create the provider component
export function ParallaxProvider({ children }: { children: React.ReactNode }) {
  // Initialize motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    // Handler for mousemove event
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX); // Update mouseX with the current X position
      mouseY.set(e.clientY); // Update mouseY with the current Y position
    };

    // Add event listener for mousemove
    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup: Remove event listener when the component unmounts
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]); // Dependencies: mouseX and mouseY

  // Provide the motion values to the context
  return (
    <ParallaxContext.Provider value={{ mouseX, mouseY }}>
      {children}
    </ParallaxContext.Provider>
  );
}

// 4) Create a custom hook to access the context
export function useParallaxContext(): ParallaxContextValue {
  const context = useContext(ParallaxContext);
  if (!context) {
    throw new Error("useParallaxContext must be used within a ParallaxProvider");
  }
  return context;
}