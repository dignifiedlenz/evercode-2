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
  const [progressVersion, setProgressVersion] = useState(0);
  const [nextUnitInfo, setNextUnitInfo] = useState<{
    chapterTitle: string;
    unitTitle: string;
  } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progressData, setProgressData] = useState<UserProgress | null>(null);

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
  }, [courseData]);

  // Fetch progress data when component mounts and when progress updates
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/progress');
        if (!response.ok) throw new Error('Failed to fetch progress');
        const data = await response.json();
        setProgressData(data.progress);
        
        // Find next incomplete unit with the fresh data
        const nextUnit = findNextIncompleteUnit(data.progress);
        setNextIncompleteUnit(nextUnit);
        
        if (nextUnit) {
          updateNextUnitInfo(nextUnit);
        } else {
          setNextUnitInfo(null);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchProgress();
  }, [findNextIncompleteUnit, updateNextUnitInfo]);

  // Listen for progress update events and refresh the data
  useEffect(() => {
    const handleProgressUpdate = () => {
      console.log("Progress update detected, refreshing data");
      fetch('/api/progress')
        .then(res => res.json())
        .then(data => {
          setProgressData(data.progress);
          const nextUnit = findNextIncompleteUnit(data.progress);
          setNextIncompleteUnit(nextUnit);
          if (nextUnit) {
            updateNextUnitInfo(nextUnit);
          }
        })
        .catch(error => {
          console.error("Failed to fetch updated progress:", error);
        });
    };

    window.addEventListener(PROGRESS_UPDATED_EVENT, handleProgressUpdate);
    return () => window.removeEventListener(PROGRESS_UPDATED_EVENT, handleProgressUpdate);
  }, [findNextIncompleteUnit, updateNextUnitInfo]);

  // Navigate to the next incomplete unit 
  const navigateToNextUnit = useCallback(() => {
    if (!nextIncompleteUnit || isLoading || isNavigating) return;
    
    setIsNavigating(true);
    console.log("Navigating to next unit:", nextIncompleteUnit);
    
    const { semesterId, chapterId, unitId } = nextIncompleteUnit;
    
    // Determine whether to navigate to video or quiz based on progress
    const unitProgress = progressData?.unitProgress?.find(
      up => up.unitId === unitId && up.chapterId === chapterId
    );
    
    const videoProgress = progressData?.videoProgress?.find(
      vp => vp.unitId === unitId && vp.chapterId === chapterId
    );
    
    // If video is not completed, go to video. Otherwise, go to quiz
    const section = (!videoProgress?.completed) ? 'video' : 'quiz';
    
    // Use Next.js router for client-side navigation
    router.push(`/course/${semesterId}/${chapterId}/${unitId}/${section}`);
  }, [nextIncompleteUnit, isLoading, isNavigating, progressData, router]);

  return (
    <div className="relative min-h-screen w-screen">
      {/* Content */}
      <div className="relative z-10">
        <div className="sm:pt-0 flex flex-col min-h-screen w-full text-white overflow-y-auto">
          <div
            className="min-h-screen min-w-screen sm:bg-cover bg-center transition-all duration-1000"
          >
            <h2 className="fixed left-1/2 hidden sm:block top-5 -translate-x-1/2 text-center text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 font-morion tracking-wider">{semesterTitle}</h2>
            
            {/* Updated overlay with gradient and better opacity */}
            <div className="min-h-screen flex flex-col lg:flex-row"> 
              {/* Main Content */}
              <div className="flex flex-col lg:flex-row w-full">
                {/* Left Content Section */}
                <div className="w-full space-y-10 sm:space-y-0 pt-28 sm:pt-0 px-4 py-6 sm:pl-24 lg:w-2/3 flex flex-col justify-center sm:px-8 lg:py-0">
                  <h1 className="text-5xl pt-16 sm:pt-0 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 lg:mb-8 font-neima">
                    Welcome Back {firstName || 'User'}!
                  </h1>
                  <div className="w-full sm:w-3/4 md:w-1/2">
                    <p className="text-xs font-morion sm:text-sm md:text-base mb-2">Your Progress</p>
                    <div className="w-full bg-zinc-800 h-1.5 sm:h-2">
                      <div
                        className="bg-white h-1.5 sm:h-2"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Resume Course Button */}
                  <div className="mt-6 font-morion mb-4">
                    <button
                      onClick={navigateToNextUnit}
                      disabled={!nextIncompleteUnit || isLoading || isNavigating}
                      className={`w-full sm:w-auto px-6 py-3 rounded transition-all duration-300 font-medium text-sm md:text-base 
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


                  {/* Teachers Section */}
                  <div className="w-full sm:w-3/4 md:w-1/2">
                    <p className="font-morion text-xs sm:text-sm md:text-base mb-4">Your Instructors for this semester</p>
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
                    <nav className="w-full max-w-sm">
                      <ul className="space-y-3 sm:space-y-4 p-5 bg-black/40 backdrop-blur-md font-morion text-xs sm:text-sm md:text-base lg:text-lg rounded-sm border border-white/10">
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
          <div className="fixed z-40 bg-gradient-to-r from-black/50 to-transparent">
            <Sidebar 
              courseData={courseData}
              currentSemester={currentSemester}
              completedUnits={completedUnits}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 