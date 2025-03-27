"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import CustomLink from "./CustomLink";
import InstructorLightbox from "./InstructorLightbox";
import courseData from "./(semester1)/courseData";
import Sidebar from "./sidebar";
import { CompletedUnits, Unit, Semester, Chapter } from "@/types/course";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserProgress } from "@/lib/progress-service";

interface DashboardContentProps {
  firstName: string;
  progress: number;
  currentSemester: number;
  completedUnits: CompletedUnits;
  semesters: Semester[];
}

// Custom event names
const PROGRESS_UPDATED_EVENT = 'progress-updated';

// Define an interface for the navigation links
interface NavLink {
  text: string;
  href: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function DashboardContent({ 
  firstName, 
  progress, 
  currentSemester,
  completedUnits,
  semesters
}: DashboardContentProps) {
  const [selectedInstructor, setSelectedInstructor] = useState<number | null>(null);
  const router = useRouter();
  const [nextIncompleteUnit, setNextIncompleteUnit] = useState<{
    semesterId: string;
    chapterId: string;
    unitId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Add a local state to force refresh when progress updates
  const [progressVersion, setProgressVersion] = useState(0);
  const [nextUnitInfo, setNextUnitInfo] = useState<{
    chapterTitle: string;
    unitTitle: string;
  } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const semester = courseData.find(sem => sem.id === `semester-${currentSemester}`);
  const instructors = semester?.instructors || [];
  const backgroundImage = semester?.backgroundImage || '/540598ldsdl.jpg';
  const semesterTitle = semester?.title?.split(': ')[1] || 'Home';

  // Get the ordered list of all units
  const orderedUnits = useMemo(() => {
    const units: { chapterId: string; unit: Unit }[] = [];
    courseData.forEach((semester: Semester) => {
      semester.chapters.forEach((chapter: Chapter) => {
        chapter.units.forEach((unit: Unit) => {
          units.push({ chapterId: chapter.id, unit });
        });
      });
    });
    return units;
  }, []);

  // Listen for progress update events and refresh the data
  useEffect(() => {
    // Function to handle progress update events
    const handleProgressUpdate = () => {
      console.log("Progress update detected, refreshing next unit data");
      // Increment version to trigger a refresh
      setProgressVersion(prev => prev + 1);
      // Fetch the latest progress data from the server
      fetch('/api/progress')
        .then(res => {
          // Check if response is ok before trying to parse JSON
          if (!res.ok) {
            throw new Error(`API responded with status: ${res.status}`);
          }
          return res.text(); // Get text instead of directly parsing JSON
        })
        .then(text => {
          // Try to parse the JSON, but handle empty or invalid responses
          if (!text) return {};
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Invalid JSON response:", text);
            return {};
          }
        })
        .then(data => {
          console.log("Fetched updated progress data:", data);
          // Re-run the findNextIncompleteUnit logic with updated data
          const result = findNextIncompleteUnit(data.progress?.unitProgress ? data.progress : completedUnits);
          if (result) {
            setNextIncompleteUnit(result);
            // Find the unit and chapter titles for display
            updateNextUnitInfo(result);
          }
        })
        .catch(error => {
          console.error("Failed to fetch updated progress:", error);
        });
    };

    // Add event listener for progress updates
    window.addEventListener(PROGRESS_UPDATED_EVENT, handleProgressUpdate);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handleProgressUpdate);
    };
  }, [completedUnits]); // Only re-add the listener if completedUnits changes

  // Update the next unit info with titles
  const updateNextUnitInfo = useCallback((unitData: { semesterId: string; chapterId: string; unitId: string }) => {
    for (const semester of courseData) {
      if (semester.id === unitData.semesterId) {
        for (const chapter of semester.chapters) {
          if (chapter.id === unitData.chapterId) {
            for (const unit of chapter.units) {
              if (unit.id === unitData.unitId) {
                setNextUnitInfo({
                  chapterTitle: chapter.title,
                  unitTitle: unit.title
                });
                return;
              }
            }
          }
        }
      }
    }
    // If we get here, we couldn't find the unit
    console.warn(`Could not find unit info for: ${JSON.stringify(unitData)}`);
    setNextUnitInfo(null);
  }, [courseData]);

  // Find the next incomplete unit
  const findNextIncompleteUnit = useCallback((progress: CompletedUnits | UserProgress) => {
    console.log("Finding next incomplete unit...");
    console.log("Progress data:", progress);
    
    if (!progress) {
      console.log("No progress data available");
      return null;
    }

    // Get all completed unit IDs with their completion status
    let unitCompletionMap: Record<string, {
      unitId: string,
      chapterId: string,
      videoCompleted: boolean,
      questionsCompleted: boolean,
      fullyCompleted: boolean
    }> = {};
    
    // Handle both CompletedUnits and UserProgress types
    if ('unitProgress' in progress && progress.unitProgress) {
      // Handle UserProgress type
      progress.unitProgress.forEach(up => {
        if (typeof up === 'object' && 
            'unitId' in up && 
            'chapterId' in up && 
            'videoCompleted' in up && 
            'questionsCompleted' in up) {
          unitCompletionMap[up.unitId] = {
            unitId: up.unitId,
            chapterId: up.chapterId,
            videoCompleted: up.videoCompleted,
            questionsCompleted: up.questionsCompleted,
            fullyCompleted: up.videoCompleted && up.questionsCompleted
          };
        }
      });

      // Also check individual video and question progress to find partial completions
      if (progress.videoProgress) {
        progress.videoProgress.forEach(vp => {
          if (typeof vp === 'object' && 'unitId' in vp && 'chapterId' in vp && 'completed' in vp) {
            if (!unitCompletionMap[vp.unitId]) {
              unitCompletionMap[vp.unitId] = {
                unitId: vp.unitId,
                chapterId: vp.chapterId,
                videoCompleted: vp.completed,
                questionsCompleted: false,
                fullyCompleted: false
              };
            } else {
              unitCompletionMap[vp.unitId].videoCompleted = unitCompletionMap[vp.unitId].videoCompleted || vp.completed;
              unitCompletionMap[vp.unitId].fullyCompleted = unitCompletionMap[vp.unitId].videoCompleted && unitCompletionMap[vp.unitId].questionsCompleted;
            }
          }
        });
      }

      if (progress.questionProgress) {
        // Group questions by unit and check if all questions for a unit are completed
        const unitQuestionMap: Record<string, {total: number, completed: number}> = {};
        
        progress.questionProgress.forEach(qp => {
          if (qp && typeof qp === 'object' && 'unitId' in qp && 'chapterId' in qp && 'correct' in qp) {
            if (!unitQuestionMap[qp.unitId]) {
              unitQuestionMap[qp.unitId] = { total: 0, completed: 0 };
            }
            
            unitQuestionMap[qp.unitId].total++;
            if (qp.correct) {
              unitQuestionMap[qp.unitId].completed++;
            }
          }
        });

        // For each unit, check if all questions are completed
        Object.entries(unitQuestionMap).forEach(([unitId, stats]) => {
          const questionsCompleted = stats.total > 0 && stats.completed === stats.total;
          
          if (!unitCompletionMap[unitId]) {
            // Get the chapter ID from any question entry
            const questionEntry = progress.questionProgress?.find(qp => 
              qp && typeof qp === 'object' && 'unitId' in qp && qp.unitId === unitId
            );
            
            const chapterId = questionEntry && typeof questionEntry === 'object' && 'chapterId' in questionEntry 
              ? questionEntry.chapterId 
              : '';
            
            unitCompletionMap[unitId] = {
              unitId,
              chapterId,
              videoCompleted: false,
              questionsCompleted,
              fullyCompleted: false
            };
          } else {
            unitCompletionMap[unitId].questionsCompleted = questionsCompleted;
            unitCompletionMap[unitId].fullyCompleted = unitCompletionMap[unitId].videoCompleted && questionsCompleted;
          }
        });
      }
    } else {
      // Handle CompletedUnits type - this format already represents fully completed units
      Object.entries(progress as CompletedUnits).forEach(([chapterId, unitIds]) => {
        unitIds.forEach(unitId => {
          unitCompletionMap[unitId] = {
            unitId,
            chapterId,
            videoCompleted: true,
            questionsCompleted: true,
            fullyCompleted: true
          };
        });
      });
    }

    console.log("Unit completion map:", unitCompletionMap);

    // First, look for units that have been started but not fully completed
    // This helps users continue where they left off
    for (const semester of courseData) {
      for (const chapter of semester.chapters) {
        for (const unit of chapter.units) {
          const unitProgress = unitCompletionMap[unit.id];
          
          // If the unit exists in our map but is not fully completed
          if (unitProgress && !unitProgress.fullyCompleted) {
            console.log(`Found partially completed unit: ${unit.id} in chapter ${chapter.id}`);
            return {
              semesterId: semester.id,
              chapterId: chapter.id,
              unitId: unit.id
            };
          }
        }
      }
    }

    // If no partially completed units found, look for the first completely untouched unit
    for (const semester of courseData) {
      for (const chapter of semester.chapters) {
        for (const unit of chapter.units) {
          if (!unitCompletionMap[unit.id]) {
            console.log(`Found completely untouched unit: ${unit.id} in chapter ${chapter.id}`);
            return {
              semesterId: semester.id,
              chapterId: chapter.id,
              unitId: unit.id
            };
          }
        }
      }
    }

    console.log("All units appear to be completed or in progress");
    return null;
  }, [courseData]); // Now depends on courseData

  // Find the next incomplete unit when component mounts or when completedUnits change
  useEffect(() => {
    console.log("Finding next incomplete unit on mount or when completedUnits change");
    setIsLoading(true);
    
    const nextUnit = findNextIncompleteUnit(completedUnits);
    setNextIncompleteUnit(nextUnit);
    
    if (nextUnit) {
      // Find chapter and unit titles for the next unit
      updateNextUnitInfo(nextUnit);
    } else {
      setNextUnitInfo(null);
    }
    
    setIsLoading(false);
  }, [findNextIncompleteUnit, completedUnits, updateNextUnitInfo]);

  // Navigate to the next incomplete unit 
  const navigateToNextUnit = useCallback(() => {
    setIsNavigating(true);
    console.log("Navigating to next unit...");
    
    // Use completedUnits instead of the progress number
    const nextUnit = findNextIncompleteUnit(completedUnits);
    console.log("Next unit to navigate to:", nextUnit);
    
    if (nextUnit) {
      const { semesterId, chapterId, unitId } = nextUnit;
      
      // Use the new routing structure
      const courseUrl = `/course/${semesterId.replace('semester-', '')}/${chapterId}/${unitId}/video`;
      console.log(`Navigating to: ${courseUrl}`);
      
      // Wait a brief moment to ensure state is updated before navigation
      setTimeout(() => {
        try {
          // Force a hard navigation to ensure the course page loads fresh
          window.location.href = courseUrl;
          console.log("Navigation initiated with direct URL change");
        } catch (error) {
          console.error("Error during navigation:", error);
          setIsNavigating(false);
        }
      }, 100);
    } else {
      setIsNavigating(false);
    }
  }, [findNextIncompleteUnit, completedUnits]);

  return (
    <div className="flex flex-col min-h-screen w-full text-white">
      <div
        className="min-h-screen bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${backgroundImage})`
        }}
      >
        <h2 className="fixed left-1/2 top-5 -translate-x-1/2 text-center text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 font-morion tracking-wider">{semesterTitle}</h2>
        
        {/* Overlay for better text readability */}
        <div className="min-h-screen bg-black bg-opacity-80 flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row w-full">
            {/* Left Content Section */}
            <div className="w-full lg:w-2/3 flex flex-col justify-center pl-12 lg:pl-28 py-8 lg:py-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 lg:mb-8 font-neima">
                Welcome Back {firstName || 'User'}!
              </h1>
              <div className="w-full md:w-1/2">
                <p className="text-xs sm:text-sm md:text-base mb-2">Your Progress</p>
                <div className="w-full bg-zinc-800 h-1.5 sm:h-2">
                  <div
                    className="bg-white h-1.5 sm:h-2"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Resume Course Button */}
              <div className="mt-4 mb-2">
                <button
                  onClick={navigateToNextUnit}
                  disabled={!nextIncompleteUnit || isLoading || isNavigating}
                  className={`px-6 py-3 rounded transition-all duration-300 font-medium text-sm md:text-base 
                    ${!nextIncompleteUnit || isLoading || isNavigating 
                      ? 'bg-zinc-700 cursor-not-allowed text-zinc-400' 
                      : 'bg-secondary hover:bg-opacity-80 text-black'}`}
                >
                  {isLoading 
                    ? 'Loading...' 
                    : isNavigating 
                      ? 'Navigating...' 
                      : nextIncompleteUnit 
                        ? 'Resume Course' 
                        : 'All Units Completed'}
                  {nextUnitInfo && !isLoading && !isNavigating && (
                    <span className="block text-xs mt-1 opacity-80">
                      {`${nextUnitInfo.chapterTitle}: ${nextUnitInfo.unitTitle}`}
                    </span>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="w-full md:w-1/2 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent my-6 sm:my-8"></div>

              {/* Teachers Section */}
              <div className="w-full md:w-1/2">
                <p className="text-xs sm:text-sm md:text-base mb-4">Your Instructors for this semester</p>
                <div className="flex items-center gap-4 sm:gap-6">
                  {instructors.map((instructor, index) => (
                    <button 
                      key={instructor.id} 
                      className="relative group focus:outline-none"
                      onClick={() => setSelectedInstructor(index + 1)}
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-secondary/30 group-hover:border-secondary transition-colors duration-300">
                        <img 
                          src={instructor.profileImage} 
                          alt={instructor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs sm:text-sm text-white/80 whitespace-nowrap">{instructor.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar Section */}
            <div className="w-full lg:w-1/3 flex flex-col lg:flex-row items-center justify-center py-8 lg:py-0">
              <aside className="flex p-5 justify-center w-full">
                <nav>
                  <ul className="space-y-3 sm:space-y-4 p-5 bg-black/50 backdrop-blur-lg font-morion text-xs sm:text-sm md:text-base lg:text-lg rounded-sm">
                    {([
                      { text: 'My Achievements', href: `/course/semester-${currentSemester}/achievements` },
                      { 
                        text: isLoading 
                          ? 'Loading next unit...'
                          : isNavigating
                            ? 'Navigating...'
                            : nextIncompleteUnit 
                              ? `Resume Course` 
                              : 'All Units Completed!', 
                        href: '#', 
                        onClick: nextIncompleteUnit && !isLoading && !isNavigating ? navigateToNextUnit : undefined,
                        disabled: !nextIncompleteUnit || isLoading || isNavigating,
                        className: nextIncompleteUnit && !isLoading && !isNavigating ? 'text-primary hover:text-primary-light font-bold' : 'opacity-70'
                      },
                      { text: 'Contact Support', href: `/course/semester-${currentSemester}/support` },
                      { text: 'Meet Your Instructors', href: `/course/semester-${currentSemester}/instructors` },
                      { text: 'View Notes', href: `/course/semester-${currentSemester}/notes` }
                    ] as NavLink[]).map((link, index) => (
                      <li key={index}>
                        {link.onClick ? (
                          <div className="flex flex-col">
                            <div 
                              onClick={link.disabled ? undefined : link.onClick} 
                              className={`cursor-pointer ${link.disabled ? 'opacity-50' : ''} ${link.className || ''}`}
                            >
                              <CustomLink href={link.href}>{link.text}</CustomLink>
                            </div>
                            {index === 1 && nextUnitInfo && !isLoading && !isNavigating && (
                              <span className="text-xs text-zinc-400 pl-5 mt-1">
                                {`${nextUnitInfo.chapterTitle}: ${nextUnitInfo.unitTitle}`}
                              </span>
                            )}
                            {index === 1 && isLoading && (
                              <span className="text-xs text-zinc-400 pl-5 mt-1">
                                Finding your next unit...
                              </span>
                            )}
                            {index === 1 && isNavigating && (
                              <span className="text-xs text-zinc-400 pl-5 mt-1">
                                Taking you to your next unit...
                              </span>
                            )}
                          </div>
                        ) : (
                          <CustomLink href={link.href}>{link.text}</CustomLink>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Lightbox */}
      <InstructorLightbox
        isOpen={!!selectedInstructor}
        onClose={() => setSelectedInstructor(null)}
        instructorId={selectedInstructor || 0}
        semesterId={currentSemester}
      />
      
      {/* Sidebar with curriculum tiles - Now will display correct progress */}
      <div className="fixed z-40 bg-gradient-to-r from-black/80 to-transparent">
        <Sidebar 
          courseData={courseData}
          currentSemester={currentSemester}
          completedUnits={completedUnits}
        />
      </div>
    </div>
  );
} 