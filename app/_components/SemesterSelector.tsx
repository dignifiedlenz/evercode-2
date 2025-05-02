"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import courseData from "./(semester1)/courseData"; // Import course data
import { useProgress, UnitProgress } from "./ProgressClient"; // Import progress hook and type
import { toast } from "sonner"; // Import toast

interface SemesterSelectorProps {
  currentSemester: number;
  onSemesterChange: (semester: number) => void; // Keep this if still used elsewhere, though direct navigation is now handled here
}

// Helper function to check semester completion
const isSemesterComplete = (
  semesterNumberToCheck: number,
  progress: ReturnType<typeof useProgress>['progress'],
  allCourseData: typeof courseData
): boolean => {
  if (!progress || semesterNumberToCheck < 1) {
    return false; // Cannot check progress or invalid semester number
  }
  const semesterToCheck = allCourseData.find(s => s.id === `semester-${semesterNumberToCheck}`);
  if (!semesterToCheck) {
    return false; // Semester not found in course data
  }

  const unitsInSemester = semesterToCheck.chapters.flatMap(ch => ch.units);
  const totalUnits = unitsInSemester.length;
  if (totalUnits === 0) {
    return true; // Empty semester is considered complete
  }

  const completedUnitsCount = unitsInSemester.filter(unit => {
    const unitProg = progress.unitProgress?.find(up => up.unitId === unit.id);
    return unitProg?.videoCompleted && unitProg.questionsCompleted >= unitProg.totalQuestions;
  }).length;

  return completedUnitsCount >= totalUnits;
};

export default function SemesterSelector({ currentSemester, onSemesterChange }: SemesterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { progress, loading: isLoadingProgress } = useProgress(); // Use progress hook

  // State to manage displayed semester in the trigger
  const [displayedSemester, setDisplayedSemester] = useState(currentSemester);

  // Update displayed semester when currentSemester prop changes (e.g., on page load)
  useEffect(() => {
    setDisplayedSemester(currentSemester);
  }, [currentSemester]);

  const handleSemesterChange = (targetSemester: number) => {
    if (isLoadingProgress) return; // Don't allow changes while progress is loading

    const previousSemesterNumber = targetSemester - 1;
    let canNavigate = true;

    if (targetSemester > 1) {
      canNavigate = isSemesterComplete(previousSemesterNumber, progress, courseData);
    }

    if (canNavigate) {
      setDisplayedSemester(targetSemester); // Update display optimistically
      // Navigate using router
      router.push(`/course/semester-${targetSemester}`);
      setIsOpen(false); // Close dropdown
      // Call callback if needed
      if (onSemesterChange) {
         onSemesterChange(targetSemester);
      }
    } else {
      toast.error(`Please complete Semester ${previousSemesterNumber} first.`);
      // Keep dropdown open potentially, or close it
      // setIsOpen(false); 
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-xs sm:text-sm text-white/60 hover:text-white transition-colors">
          Semester {displayedSemester}
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="bg-black/80 backdrop-blur-sm border-white/10 text-white font-morion min-w-[120px]"
        align="start"
      >
        {courseData.map((semester) => {
          const semesterNumber = parseInt(semester.id.replace('semester-', ''), 10);
          const previousSemesterNumber = semesterNumber - 1;
          let isLocked = false;

          if (semesterNumber > 1 && !isLoadingProgress) {
            isLocked = !isSemesterComplete(previousSemesterNumber, progress, courseData);
          }

          return (
            <DropdownMenuItem
              key={semester.id}
              disabled={isLocked} // Keep disabled prop for accessibility
              onSelect={(event) => {
                if (isLocked) {
                  event.preventDefault();
                  toast.error(`Please complete Semester ${previousSemesterNumber} first.`);
                } else {
                  handleSemesterChange(semesterNumber);
                }
              }}
              // Updated className logic:
              className={[
                "text-xs sm:text-sm transition-colors duration-150", // Base styles
                isLocked 
                  ? "opacity-50 cursor-not-allowed text-white/50" // Locked styles (no focus)
                  : "cursor-pointer hover:bg-white/10 hover:text-secondary focus:outline-none focus:bg-white/10 focus:text-secondary" // Unlocked styles (with focus)
              ].join(' ')}
            >
              Semester {semesterNumber}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 