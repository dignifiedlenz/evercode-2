// src/components/ui/Progress.tsx

"use client";

import React from "react";

interface ProgressProps {
  value: number; // Progress value (0-100)
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  const clampedValue = Math.min(Math.max(value, 0), 100); // Ensure value is between 0 and 100
  return (
    <div className={`relative h-2 w-full bg-gray-600 rounded ${className}`}>
      <div
        style={{ width: `${clampedValue}%` }}
        className="absolute top-0 left-0 h-full bg-secondary rounded transition-width duration-300"
      />
    </div>
  );
};
