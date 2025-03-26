"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SemesterSelectorProps {
  currentSemester: number;
  onSemesterChange?: (semester: number) => void;
}

export default function SemesterSelector({ currentSemester, onSemesterChange }: SemesterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Ensures the component updates when navigating to a different semester
  const [displayedSemester, setDisplayedSemester] = useState(currentSemester);

  // Update displayed semester when currentSemester prop changes
  useEffect(() => {
    setDisplayedSemester(currentSemester);
  }, [currentSemester]);

  const handleSemesterChange = (semester: number) => {
    // Update the UI immediately
    setDisplayedSemester(semester);
    
    // Call the callback if provided (for backward compatibility)
    if (onSemesterChange) {
      onSemesterChange(semester);
    }
    
    // Navigate to the dashboard of the selected semester
    router.push(`/course/semester-${semester}`);
    
    // Close the dropdown
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-start gap-2 text-sm pl-1 text-white/60 hover:text-white transition-colors duration-200"
      >
        <span>Semester {displayedSemester}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-zinc-900 rounded-sm shadow-lg border border-white/10 overflow-hidden z-50">
          {[1, 2, 3].map((semester) => (
            <button
              key={semester}
              onClick={() => handleSemesterChange(semester)}
              className={`w-full px-4 py-2 text-left text-sm transition-colors duration-200 flex items-center justify-between ${
                semester === displayedSemester
                  ? 'bg-secondary/20 text-secondary'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Semester {semester}</span>
              {semester === displayedSemester && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 