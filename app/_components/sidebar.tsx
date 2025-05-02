// src/components/Sidebar.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Semester } from "@/types/course";
import CustomLink from "./CustomLink";
import { getUserProgress } from '@/lib/progress-service';
import { useTransitionRouter } from 'next-view-transitions';

interface SidebarProps {
  courseData: Semester[];
  currentSemester: number;
  completedUnits?: Record<string, boolean>;
}

interface ChapterProgress {
  chapterId: string;
  percentage: number;
}

export default function Sidebar({ courseData, currentSemester, completedUnits }: SidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [chapterProgress, setChapterProgress] = useState<ChapterProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useTransitionRouter();

  // Get the current semester data based on the prop - REINSTATED
  const currentSemesterData = useMemo(() => 
    courseData.find(sem => sem.id === `semester-${currentSemester}`),
    [courseData, currentSemester] // Depend on prop
  );

  // Memoized function to calculate progress from API data
  const calculateProgressFromAPI = useCallback((progress: any) => {
    if (!currentSemesterData) return [];
    
    // Get all unit IDs for this semester to filter progress data
    const semesterUnitIds = new Set(
      currentSemesterData.chapters.flatMap(ch => ch.units.map(u => u.id))
    );
    
    return currentSemesterData.chapters.map(chapter => {
      let totalPoints = 0;
      let earnedPoints = 0;

      // Calculate points for each unit in the chapter
      chapter.units.forEach(unit => {
        // Each video is worth 5 points
        totalPoints += 5;
        // Each question is worth 1 point
        totalPoints += unit.video.questions.length;

        // Check video completion - only count if unit belongs to this semester
        const videoCompleted = progress.videoProgress?.some(
          (vp: any) => vp.unitId === unit.id && 
                vp.chapterId === chapter.id && 
                vp.completed &&
                semesterUnitIds.has(unit.id)
        );
        if (videoCompleted) earnedPoints += 5;

        // Check question completion - only count if unit belongs to this semester
        const completedQuestions = progress.questionProgress?.filter(
          (qp: any) => qp.unitId === unit.id && 
                qp.chapterId === chapter.id && 
                qp.correct &&
                semesterUnitIds.has(unit.id)
        ).length || 0;
        earnedPoints += completedQuestions;
      });

      const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      return {
        chapterId: chapter.id,
        percentage
      };
    });
  }, [currentSemesterData]);

  // Updated function to calculate progress from the correct completedUnits format
  const calculateProgressFromCompletedUnits = useCallback(() => {
    if (!currentSemesterData) return [];
    
    return currentSemesterData.chapters.map(chapter => {
      const totalUnits = chapter.units.length;
      let completedUnitCount = 0;
      
      // Count completed units using the new format
      if (completedUnits) {
        chapter.units.forEach(unit => {
          // Check if the unit ID exists as a key and is true
          if (completedUnits[unit.id]) { 
            completedUnitCount++;
          }
        });
      }
      
      const percentage = totalUnits > 0 ? Math.round((completedUnitCount / totalUnits) * 100) : 0;
      return {
        chapterId: chapter.id,
        percentage
      };
    });
  }, [currentSemesterData, completedUnits]);

  // Load progress data - Modify this useEffect
  useEffect(() => {
    let isMounted = true;
    
    const loadProgress = async () => {
      try {
        console.log('[Sidebar] Starting to load progress data');
        // Use completedUnits from props if available first
        if (completedUnits && currentSemesterData) {
          console.log('[Sidebar] Using completedUnits from props');
          const calculatedProgress = calculateProgressFromCompletedUnits();
          setChapterProgress(calculatedProgress);
          setIsLoading(false);
          return; // Exit early if we have props data
        }
        
        // Only try to fetch from API if completedUnits prop is not available
        if (!completedUnits) {
          console.log('[Sidebar] No completedUnits from props, trying API');
          try {
            // Add error handling for the API call
            const response = await fetch('/api/progress', {
              // Adding cache: no-store to prevent caching issues
              cache: 'no-store'
            });

            // Handle auth errors gracefully without causing redirects
            if (response.status === 401) {
              console.log('[Sidebar] Auth error in progress API - handling gracefully');
              if (isMounted) {
                setChapterProgress([]);
                setIsLoading(false);
              }
              return;
            }
            
            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }
            
            const progress = await response.json();
            
            if (!isMounted) return;
            
            if (progress && progress.unitProgress && currentSemesterData) {
              console.log('[Sidebar] Got progress from API');
              // Calculate progress using API data if available
              const calculatedProgress = calculateProgressFromAPI(progress);
              setChapterProgress(calculatedProgress);
            } else {
              console.log('[Sidebar] No usable data from API');
              // No progress data available
              setChapterProgress([]);
            }
          } catch (apiError) {
            console.error('[Sidebar] API error:', apiError);
            if (!isMounted) return;
            // Handle API errors gracefully
            setChapterProgress([]);
          }
        }
      } catch (error) {
        console.error('[Sidebar] Failed to load progress:', error);
        
        if (!isMounted) return;
        setChapterProgress([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // *** DELAY THE EXECUTION ***
    const timerId = setTimeout(() => {
      if (isMounted) {
        console.log('[Sidebar] Running delayed loadProgress');
        loadProgress();
      }
    }, 500); // Longer delay (500ms) to ensure server components have loaded first
    
    return () => {
      isMounted = false;
      clearTimeout(timerId); // Clear the timeout on cleanup
    };
  }, [currentSemesterData, completedUnits, calculateProgressFromAPI, calculateProgressFromCompletedUnits]);

  // Handle menu animation
  const toggleMenu = useCallback(() => {
    if (isMenuOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsMenuOpen(false);
        setIsAnimating(false);
      }, 800); // Match this with CSS animation duration
      
      return () => clearTimeout(timer);
    } else {
      setIsMenuOpen(true);
      setIsAnimating(false);
    }
  }, [isMenuOpen]);

  // Generate chapter links - memoized to prevent recalculation
  const chapterLinks = useMemo(() => {
    if (!currentSemesterData) return null;
    
    return currentSemesterData.chapters.map((chapter, index) => {
      const progress = chapterProgress.find(cp => cp.chapterId === chapter.id);
      const progressPercentage = progress?.percentage || 0;

      return (
        <div 
          key={chapter.id}
          onClick={() => {
            // Close menu when a link is clicked
            setIsAnimating(true);
            setTimeout(() => {
              setIsMenuOpen(false);
              setIsAnimating(false);
            }, 800);

            // Use transition router for navigation
            const url = `/course/semester-${currentSemester}/${chapter.id}`;
            router.push(url, {
              onTransitionReady: () => {
                // Animate out (old page)
                document.documentElement.animate(
                  [
                    { transform: 'translateY(0)', opacity: 1 },
                    { transform: 'translateY(-100%)', opacity: 0 }
                  ],
                  {
                    duration: 1000,
                    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                    fill: "forwards",
                    pseudoElement: "::view-transition-old(content)"
                  }
                );

                // Animate in (new page)
                document.documentElement.animate(
                  [
                    { transform: 'translateY(100%)', opacity: 0 },
                    { transform: 'translateY(0)', opacity: 1 }
                  ],
                  {
                    duration: 1000,
                    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                    fill: "forwards",
                    pseudoElement: "::view-transition-new(content)"
                  }
                );
              }
            });
          }}
          className="block relative w-full flex-1 overflow-hidden group transition-all duration-500 hover:scale-[1.02] tile-animate bg-gradient-to-b from-black/90 to-black/10"
          style={{ 
            animationDelay: !isAnimating ? `${index * 100}ms` : '0ms'
          }}
        >
          {/* Background Image with lazy loading */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-black"
            style={{ backgroundImage: `url(${chapter.backgroundImage})` }}
          />
          
          {/* Base Dark Overlay - Always visible */}
          <div className="absolute inset-0 bg-black/75 group-hover:bg-black/35 transition-all duration-700 ease-out" />
          
          {/* Non-progress overlay - Darkens the incomplete part */}
          <div 
            className="absolute inset-0 bg-black/50 transition-[clip-path] duration-700 ease-out"
            style={{ 
              clipPath: `inset(0 0 0 ${progressPercentage}%)`
            }}
          />
          
          {/* Vignette Effect - Subtle vignette for readability */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-2 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-neima text-white sm:mb-4 mb-2 group-hover:text-secondary transition-colors duration-700 ease-out">
              {chapter.title.replace(/^Chapter \d+:\s*/, '')}
            </h3>
            
            {/* Progress and Units count */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-secondary font-morion text-sm sm:text-lg">
                {progressPercentage}%
              </span>
              <div className="flex items-center gap-3">
                <span className="text-white/50 font-morion text-xs">
                  {chapter.units.length} Units
                </span>
                <span className="text-secondary group-hover:translate-x-2 transition-transform duration-700 ease-out">
                  <img src="/EvermodeArrow.svg" alt="arrow-right" className="w-6 h-6" />
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    });
  }, [currentSemesterData, currentSemester, chapterProgress, isAnimating, router]);

  return (
    <>
      <style jsx global>{`
        @keyframes slideInFade {
          0% {
            opacity: 0;
            transform: translateX(-100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutFade {
          0% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-100%);
          }
        }
        .tile-animate {
          opacity: 0;
          animation-duration: 800ms;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
        .menu-open .tile-animate {
          animation-name: slideInFade;
        }
        .menu-container {
          pointer-events: auto;
          transition: transform 800ms ease-out, 
                      opacity 800ms ease-out;
        }
        .menu-container.closing {
          opacity: 0;
          transform: translateX(-100%);
          pointer-events: none;
          animation: slideOutFade 800ms ease-out;
        }
        .progress-bar {
          transition: width 1s ease-out;
        }
      `}</style>

      {/* Fixed sidebar that always stays on top */}
      <div className="fixed top-16 sm:top-[90vh] left-4 sm:bottom-0 sm:left-5 md:bottom-5 md:left-10 h-fit w-10 sm:min-w-28 flex flex-col justify-end sm:p-5 gap-y-6 z-50">
        <div onClick={toggleMenu} className="relative z-50">
          <CustomLink 
            href="#" 
            fontSize="text-xs sm:text-xl" 
            fontFamily="font-morion"
            arrowSize={24}
            className={`uppercase tracking-wider ${isMenuOpen ? 'text-secondary' : ''}`}
          >
            curriculum
          </CustomLink>
        </div>
      </div>

      {/* Menu container with proper animation handling */}
      {(isMenuOpen || isAnimating) && (
        <div 
          className={`fixed inset-0 z-40 menu-container ${isAnimating ? 'closing' : ''}`}
          aria-hidden={!isMenuOpen}
        >
          <div className={`h-screen flex flex-col ${isMenuOpen && !isAnimating ? 'menu-open' : ''}`}>
            <div className="pt-28 sm:pt-0 h-full">
              {/* Show loading indicator if still loading */}
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-white font-morion">Loading curriculum...</div>
                </div>
              ) : (
                <div className="space-y-0 h-full flex flex-col">
                  {chapterLinks}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
