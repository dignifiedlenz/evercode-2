// src/components/Sidebar.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Semester } from "@/types/course";
import CustomLink from "./CustomLink";
import { getUserProgress } from '@/lib/progress-service';
import Image from "next/image";

interface SidebarProps {
  courseData: Semester[];
  currentSemester: number;
  completedUnits?: Record<string, string[]>;
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

  // Get the current semester data based on the selected semester - memoized
  const currentSemesterData = useMemo(() => 
    courseData.find(sem => sem.id === `semester-${currentSemester}`),
    [courseData, currentSemester]
  );

  // Memoized function to calculate progress from API data
  const calculateProgressFromAPI = useCallback((progress: any) => {
    if (!currentSemesterData) return [];
    
    return currentSemesterData.chapters.map(chapter => {
      let totalPoints = 0;
      let earnedPoints = 0;

      // Calculate points for each unit in the chapter
      chapter.units.forEach(unit => {
        // Each video is worth 5 points
        totalPoints += 5;
        // Each question is worth 1 point
        totalPoints += unit.video.questions.length;

        // Check video completion
        const videoCompleted = progress.videoProgress?.some(
          (vp: any) => vp.unitId === unit.id && 
                vp.chapterId === chapter.id && 
                vp.completed
        );
        if (videoCompleted) earnedPoints += 5;

        // Check question completion
        const completedQuestions = progress.questionProgress?.filter(
          (qp: any) => qp.unitId === unit.id && 
                qp.chapterId === chapter.id && 
                qp.correct
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

  // Memoized function to calculate progress from completed units
  const calculateProgressFromCompletedUnits = useCallback(() => {
    if (!currentSemesterData) return [];
    
    return currentSemesterData.chapters.map(chapter => {
      let totalUnits = chapter.units.length;
      let completedUnitCount = 0;
      
      // Count completed units for this chapter
      if (completedUnits && completedUnits[chapter.id]) {
        chapter.units.forEach(unit => {
          if (completedUnits[chapter.id].includes(unit.id)) {
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

  // Load progress data - only when dependencies change
  useEffect(() => {
    let isMounted = true;
    
    const loadProgress = async () => {
      try {
        // Try to get progress from API first
        const progress = await getUserProgress();
        
        if (!isMounted) return;
        
        if (progress && progress.unitProgress && currentSemesterData) {
          // Calculate progress using API data if available
          const calculatedProgress = calculateProgressFromAPI(progress);
          setChapterProgress(calculatedProgress);
        } else if (completedUnits && currentSemesterData) {
          // Fall back to completedUnits if API data is not available
          const calculatedProgress = calculateProgressFromCompletedUnits();
          setChapterProgress(calculatedProgress);
        } else {
          // No progress data available
          setChapterProgress([]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load progress:', error);
        
        if (!isMounted) return;
        
        // Fall back to completedUnits if API call fails
        if (completedUnits && currentSemesterData) {
          const calculatedProgress = calculateProgressFromCompletedUnits();
          setChapterProgress(calculatedProgress);
        } else {
          setChapterProgress([]);
        }
        
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    loadProgress();
    
    return () => {
      isMounted = false;
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
        <Link 
          href={`/course/semester-${currentSemester}/${chapter.id}`} 
          key={chapter.id}
          onClick={() => {
            // Close menu when a link is clicked
            setIsAnimating(true);
            setTimeout(() => {
              setIsMenuOpen(false);
              setIsAnimating(false);
            }, 800);
          }}
          className="block relative w-full flex-1 overflow-hidden group transition-all duration-500 hover:scale-[1.02] tile-animate"
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
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6">
            <h3 className="text-2xl font-neima text-white mb-4 group-hover:text-secondary transition-colors duration-700 ease-out">
              {chapter.title.replace(/^Chapter \d+:\s*/, '')}
            </h3>
            
            {/* Progress and Units count */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-secondary font-morion text-lg">
                {progressPercentage}%
              </span>
              <div className="flex items-center gap-3">
                <span className="text-white/50 font-morion text-sm">
                  {chapter.units.length} Units
                </span>
                <span className="text-secondary group-hover:translate-x-2 transition-transform duration-700 ease-out">
                  <img src="/EvermodeArrow.svg" alt="arrow-right" className="w-6 h-6" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      );
    });
  }, [currentSemesterData, currentSemester, chapterProgress, isAnimating]);

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
      <div className="fixed bottom-0 left-5 h-fit min-w-28 flex flex-col justify-end p-5 gap-y-6 z-50">
        <div onClick={toggleMenu} className="relative z-50">
          <CustomLink 
            href="#" 
            fontSize="text-xl" 
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
            <div className="p-0 h-full">
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
