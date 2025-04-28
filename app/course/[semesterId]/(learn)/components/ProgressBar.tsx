"use client";

import { useParams } from 'next/navigation';
import courseData from '@/app/_components/(semester1)/courseData';
import { useState, useEffect } from 'react';
import { useProgress, UnitProgress as HookUnitProgress } from '@/app/_components/ProgressClient';
import { useChronologicalMode } from '@/app/context/ChronologicalModeContext';
import { toast } from 'sonner';
import { useTransitionRouter } from 'next-view-transitions';

interface ProgressBarProps {
  currentChapterId: string;
  currentUnitId: string;
  currentSection: 'video' | 'quiz';
}

export default function ProgressBar({ currentChapterId, currentUnitId, currentSection }: ProgressBarProps) {
  const router = useTransitionRouter();
  const { semesterId } = useParams();
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);
  const { isChronologicalMode } = useChronologicalMode();
  const { progress: progressData, loading: isLoadingProgress, error: progressError } = useProgress();

  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === currentChapterId);
  const units = chapter?.units || [];

  // Log current params and progress hook state for debugging
  useEffect(() => {
    console.log('ProgressBar rendering with:', {
      semesterId,
      currentChapterId,
      currentUnitId,
      currentSection,
      isLoadingProgress,
      hasProgressData: !!progressData,
      progressError,
      unitProgressCount: progressData?.unitProgress?.length,
    });
  }, [semesterId, currentChapterId, currentUnitId, currentSection, isLoadingProgress, progressData, progressError]);

  // Helper function to check if a unit's video is completed using hook data
  const isVideoCompleted = (unitId: string): boolean => {
    if (!progressData?.unitProgress) return false;
    const unitProgress = progressData.unitProgress.find((up: HookUnitProgress) => up.unitId === unitId);
    return unitProgress?.videoCompleted === true;
  };
  
  // Helper function to check if a unit's quiz is completed using hook data
  const isQuizCompleted = (unitId: string): boolean => {
    if (!progressData?.unitProgress) return false;
    const unitProgress = progressData.unitProgress.find((up: HookUnitProgress) => up.unitId === unitId);
    // Use totalQuestions from progress data if available, default to 5 otherwise
    const totalQuestions = unitProgress?.totalQuestions ?? 5; 
    return !!unitProgress?.questionsCompleted && unitProgress.questionsCompleted >= totalQuestions;
  };
  
  // Helper function to check if a unit is fully completed (video + quiz)
  const isUnitFullyCompleted = (unitId: string): boolean => {
     return isVideoCompleted(unitId) && isQuizCompleted(unitId);
  };

  const canAccessUnit = (unitIndex: number, isQuiz: boolean): boolean => {
    if (!isChronologicalMode || isLoadingProgress) return !isLoadingProgress; // Allow access if not chronological or still loading

    // Find the unit corresponding to the index
    const unit = units[unitIndex];
    if (!unit) return false; // Should not happen

    // First unit's video is always accessible
    if (unitIndex === 0 && !isQuiz) return true;

    // For quiz sections, check if the video of the same unit is completed
    if (isQuiz) {
      return isVideoCompleted(unit.id);
    }

    // For videos (not the first one), check if the *previous* unit is fully completed
    if (unitIndex > 0) {
      const previousUnit = units[unitIndex - 1];
      if (!previousUnit) return false; // Should not happen

      const previousUnitProgress = progressData?.unitProgress?.find((up: HookUnitProgress) => up.unitId === previousUnit.id);
      if (!previousUnitProgress) return false; // No progress means not complete

      const totalPrevQuestions = previousUnitProgress.totalQuestions ?? 5;
      const isPrevVideoDone = previousUnitProgress.videoCompleted;
      const isPrevQuizDone = previousUnitProgress.questionsCompleted >= totalPrevQuestions;

      // If the previous unit has questions, both video and quiz must be done.
      // If it doesn't have questions (totalQuestions likely 0 or undefined), only video needs to be done.
      const prevHasQuestions = previousUnit.video?.questions?.length > 0;
      const isPreviousUnitComplete = prevHasQuestions 
        ? (isPrevVideoDone && isPrevQuizDone) 
        : isPrevVideoDone;
        
      return isPreviousUnitComplete;
    }

    // Fallback for the first unit's video (already handled above, but for safety)
    return true;
  };

  const handleUnitClick = (unitId: string, section: 'video' | 'quiz', unitIndex: number) => {
    const isQuiz = section === 'quiz';
    
    if (!canAccessUnit(unitIndex, isQuiz)) {
      toast.error(
        isQuiz 
          ? "Complete the video section first"
          : "Complete the previous unit before proceeding",
        {
          position: 'bottom-center'
        }
      );
      return;
    }
    
    const url = `/course/${semesterId}/${currentChapterId}/${unitId}/${section}`;
    
    // Determine transition direction based on curriculum flow
    const currentUnitIndex = units.findIndex(unit => unit.id === currentUnitId);
    const isMovingForward = unitIndex > currentUnitIndex || 
      (unitIndex === currentUnitIndex && isQuiz && currentSection === 'video');
    const isMovingBackward = unitIndex < currentUnitIndex || 
      (unitIndex === currentUnitIndex && !isQuiz && currentSection === 'quiz');
    
    // Define the transition animation
    const pageAnimation = () => {
      try {
        // Determine slide direction based on curriculum flow
        const slideDistance = '100%';
        const slideDirection = isMovingForward ? '-' : '';
        
        // Animate out (old page)
        document.documentElement.animate(
          [
            { transform: 'translateY(0)', opacity: 1 },
            { transform: `translateY(${slideDirection}${slideDistance})`, opacity: 0 }
          ],
          {
            duration: 1000,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)", // Smooth ease-in-out
            fill: "forwards",
            pseudoElement: "::view-transition-old(content)"
          }
        );

        // Animate in (new page)
        document.documentElement.animate(
          [
            { transform: `translateY(${slideDirection === '-' ? '' : '-'}${slideDistance})`, opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
          ],
          {
            duration: 1000,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)", // Smooth ease-in-out
            fill: "forwards",
            pseudoElement: "::view-transition-new(content)"
          }
        );
      } catch (error) {
        console.warn('View transition animation failed:', error);
        // Fallback to normal navigation if transition fails
        router.push(url);
      }
    };

    // Use transition-aware navigation with a fallback
    try {
      router.push(url, {
        onTransitionReady: pageAnimation
      });
    } catch (error) {
      console.warn('View transition navigation failed:', error);
      // Fallback to normal navigation
      router.push(url);
    }
  };

  // Calculate total number of indicators (video + quiz) for spacing
  const totalIndicators = units.reduce((total, unit) => {
    return total + (unit.video?.questions?.length > 0 ? 2 : 1);
  }, 0);

  // Find the current unit's index and whether it's a quiz
  const currentUnitIndex = units.findIndex(unit => unit.id === currentUnitId);
  const isCurrentQuiz = currentSection === 'quiz';
  
  // Calculate progress percentage based on both video and quiz positions
  const calculateProgressPercentage = () => {
    if (currentUnitIndex === -1 || totalIndicators <= 1) return '0%';
    
    let progressCount = 0;
    for (let i = 0; i < units.length; i++) {
      const unitHasQuestions = units[i].video?.questions?.length > 0;
      if (i < currentUnitIndex) {
        // Count both video and quiz for completed units before the current one
        progressCount += unitHasQuestions ? 2 : 1;
      } else if (i === currentUnitIndex) {
        // For current unit:
        progressCount += 1; // Always count the video part
        // If in quiz section and it has questions, count the quiz part too
        if (isCurrentQuiz && unitHasQuestions) {
          progressCount += 1;
        }
        break; // Stop counting after current unit
      }
    }
    
    // Calculate percentage based on the *segments* between indicators
    const percentage = ((progressCount - 1) * 100) / (totalIndicators - 1);
      
    return `${Math.max(0, Math.min(100, percentage))}%`; // Clamp between 0 and 100
  };

  const progressPercentage = calculateProgressPercentage();

  // Handle loading state
  if (isLoadingProgress) {
    // Instead of showing loading, render the bar with default states
    return (
      <div className="fixed left-5 sm:left-12 inset-y-0 flex flex-col items-center z-50">
        <div className="h-full py-28 sm:py-24 flex flex-col justify-between">
          <div className="w-[1px] sm:w-[2px] h-full relative">
            <div className="absolute inset-0 bg-zinc-500" />
            <div className="absolute top-0 left-0 w-full bg-secondary transition-all duration-700 ease-in-out" style={{ height: '0%' }} />
            {units.map((unit, index) => {
              const isCurrentUnit = unit.id === currentUnitId;
              const hasQuestions = unit.video?.questions?.length > 0;
              
              let indicatorCount = 0;
              for (let i = 0; i < index; i++) {
                indicatorCount += units[i].video?.questions?.length > 0 ? 2 : 1;
              }
              
              const videoPosition = totalIndicators > 1 
                ? `${(indicatorCount * 100) / (totalIndicators - 1)}%`
                : '0%';
              const quizPosition = totalIndicators > 1 && hasQuestions
                ? `${((indicatorCount + 1) * 100) / (totalIndicators - 1)}%`
                : videoPosition;

              return (
                <div key={unit.id}>
                  {/* Video diamond */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: videoPosition }}
                  >
                    <div
                      className={`
                        w-2 h-2 sm:w-3 sm:h-3 transform rotate-45 
                        ${isCurrentUnit && !isCurrentQuiz
                          ? 'bg-white border-[1.5px] sm:border-2 border-secondary scale-125'
                          : 'bg-zinc-400'
                        }
                        transition-all duration-200
                      `}
                    />
                  </div>

                  {/* Quiz dot */}
                  {hasQuestions && (
                    <div 
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{ top: quizPosition }}
                    >
                      <div
                        className={`
                          w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full 
                          ${isCurrentUnit && isCurrentQuiz
                            ? 'bg-white border-[1.5px] sm:border-2 border-secondary scale-125'
                            : 'bg-zinc-400'
                          }
                          transition-all duration-200
                        `}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (progressError) {
    console.error("ProgressBar Error:", progressError);
    // Show error state but keep the bar visible
    return (
      <div className="fixed left-5 sm:left-12 inset-y-0 flex flex-col items-center z-50">
        <div className="h-full py-28 sm:py-24 flex flex-col justify-between">
          <div className="w-[1px] sm:w-[2px] h-full relative">
            <div className="absolute inset-0 bg-zinc-500" />
            <div className="absolute top-0 left-0 w-full bg-red-500 transition-all duration-700 ease-in-out" style={{ height: progressPercentage }} />
            {/* Same indicator rendering as loading state */}
            {units.map((unit, index) => {
              const isCurrentUnit = unit.id === currentUnitId;
              const hasQuestions = unit.video?.questions?.length > 0;
              
              let indicatorCount = 0;
              for (let i = 0; i < index; i++) {
                indicatorCount += units[i].video?.questions?.length > 0 ? 2 : 1;
              }
              
              const videoPosition = totalIndicators > 1 
                ? `${(indicatorCount * 100) / (totalIndicators - 1)}%`
                : '0%';
              const quizPosition = totalIndicators > 1 && hasQuestions
                ? `${((indicatorCount + 1) * 100) / (totalIndicators - 1)}%`
                : videoPosition;

              return (
                <div key={unit.id}>
                  <div 
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: videoPosition }}
                  >
                    <div
                      className={`
                        w-2 h-2 sm:w-3 sm:h-3 transform rotate-45 
                        ${isCurrentUnit && !isCurrentQuiz
                          ? 'bg-white border-[1.5px] sm:border-2 border-red-500 scale-125'
                          : 'bg-zinc-400'
                        }
                        transition-all duration-200
                      `}
                    />
                  </div>

                  {hasQuestions && (
                    <div 
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{ top: quizPosition }}
                    >
                      <div
                        className={`
                          w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full 
                          ${isCurrentUnit && isCurrentQuiz
                            ? 'bg-white border-[1.5px] sm:border-2 border-red-500 scale-125'
                            : 'bg-zinc-400'
                          }
                          transition-all duration-200
                        `}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-5 sm:left-12 inset-y-0 flex flex-col items-center z-50">
      {/* Container for spacing */}
      <div className="h-full py-28 sm:py-24 flex flex-col justify-between">
        {/* Progress bar container */}
        <div className="w-[1px] sm:w-[2px] h-full relative">
          {/* Background bar */}
          <div className="absolute inset-0 bg-zinc-500" />
          
          {/* Progress fill */}
          <div 
            className="absolute top-0 left-0 w-full bg-secondary transition-all duration-700 ease-in-out"
            style={{ height: progressPercentage }}
          />

          {/* Progress indicators */}
          {units.map((unit, index) => {
            const isCurrentUnit = unit.id === currentUnitId;
            const hasQuestions = unit.video?.questions?.length > 0;
            
            // Use helper functions based on hook data
            const isVideoComplete = isVideoCompleted(unit.id);
            const isQuizComplete = hasQuestions && isQuizCompleted(unit.id); // Only check quiz if it exists
            // No longer need isCompleted separately, use isVideoComplete/isQuizComplete

            const canAccessVideo = canAccessUnit(index, false);
            const canAccessQuiz = hasQuestions && canAccessUnit(index, true);
            
            // Calculate positions for both video and quiz indicators
            let indicatorCount = 0;
            for (let i = 0; i < index; i++) {
              indicatorCount += units[i].video?.questions?.length > 0 ? 2 : 1;
            }
            
            // Position calculation needs careful review based on totalIndicators
            const videoPosition = totalIndicators > 1 
              ? `${(indicatorCount * 100) / (totalIndicators - 1)}%`
              : '0%';
            const quizPosition = totalIndicators > 1 && hasQuestions
              ? `${((indicatorCount + 1) * 100) / (totalIndicators - 1)}%`
              : videoPosition; // Quiz dot shares position if no other indicators or no quiz
            
            // Determine if the indicator represents a point in the past relative to current navigation
            const isPastVideo = index < currentUnitIndex || (index === currentUnitIndex && isCurrentQuiz);
            const isPastQuiz = index < currentUnitIndex;


            return (
              <div key={unit.id}>
                {/* Video diamond */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ top: videoPosition }}
                >
                  <div
                    className={`
                      w-2 h-2 sm:w-3 sm:h-3 transform rotate-45 
                      ${!canAccessVideo && isChronologicalMode ? 'bg-zinc-800 cursor-not-allowed' : 'cursor-pointer'}
                      ${isCurrentUnit && !isCurrentQuiz
                        ? 'bg-white border-[1.5px] sm:border-2 border-secondary scale-125' // Highlight current video
                        : isVideoComplete
                          ? 'bg-secondary ring-2 ring-secondary/20' // Completed video
                          : isPastVideo 
                              ? 'bg-secondary' // Past videos (before current location) are filled
                              : 'bg-zinc-400 hover:bg-secondary' // Future accessible videos
                      }
                      transition-all duration-200
                    `}
                    onClick={() => handleUnitClick(unit.id, 'video', index)}
                    onMouseEnter={() => setHoveredUnit(unit.id)}
                    onMouseLeave={() => setHoveredUnit(null)}
                  />
                  
                  {/* Video tooltip */}
                  {hoveredUnit === unit.id && (
                    <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-black/90 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap font-morion z-10">
                      <div className="flex items-center gap-2">
                        {unit.title}
                        {isVideoComplete && (
                          <svg className="w-4 h-4 text-secondary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {!canAccessVideo && isChronologicalMode && (
                          <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-black/90" />
                    </div>
                  )}
                </div>

                {/* Quiz dot */}
                {hasQuestions && (
                  <div 
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: quizPosition }}
                  >
                    <div
                      className={`
                        w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full 
                        ${!canAccessQuiz && isChronologicalMode ? 'bg-zinc-800 cursor-not-allowed' : 'cursor-pointer'}
                        ${isCurrentUnit && isCurrentQuiz
                          ? 'bg-white border-[1.5px] sm:border-2 border-secondary scale-125' // Highlight current quiz
                          : isQuizComplete
                            ? 'bg-secondary ring-2 ring-secondary/20' // Completed quiz
                            : isPastQuiz
                                ? 'bg-secondary' // Past quizzes (before current unit) are filled
                                : 'bg-zinc-400 hover:bg-secondary' // Future accessible quizzes
                        }
                        transition-all duration-200
                      `}
                      onClick={() => handleUnitClick(unit.id, 'quiz', index)}
                      onMouseEnter={() => setHoveredUnit(`${unit.id}-quiz`)}
                      onMouseLeave={() => setHoveredUnit(null)}
                    >
                      {/* Quiz tooltip */}
                      {hoveredUnit === `${unit.id}-quiz` && (
                        <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-black/90 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap font-morion z-10">
                          <div className="flex items-center gap-2">
                            {unit.title ? `${unit.title} Quiz` : 'Quiz'}
                            {isQuizComplete && (
                              <svg className="w-4 h-4 text-secondary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            {!canAccessQuiz && isChronologicalMode && (
                              <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-black/90" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 