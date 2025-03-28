"use client";

import { useRouter, useParams } from 'next/navigation';
import courseData from '@/app/_components/(semester1)/courseData';
import { useState } from 'react';

interface ProgressBarProps {
  currentChapterId: string;
  currentUnitId: string;
  currentSection: 'video' | 'quiz';
}

export default function ProgressBar({ currentChapterId, currentUnitId, currentSection }: ProgressBarProps) {
  const router = useRouter();
  const { semesterId } = useParams();
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);

  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === currentChapterId);
  const units = chapter?.units || [];

  const handleUnitClick = (unitId: string, section: 'video' | 'quiz') => {
    router.push(`/course/${semesterId}/${currentChapterId}/${unitId}/${section}`);
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
    if (currentUnitIndex === -1) return '0%';
    
    let progressCount = 0;
    for (let i = 0; i < units.length; i++) {
      if (i < currentUnitIndex) {
        // Count both video and quiz for completed units
        progressCount += units[i].video?.questions?.length > 0 ? 2 : 1;
      } else if (i === currentUnitIndex) {
        // For current unit:
        // - If in quiz section, count both video and quiz
        // - If in video section, only count up to video
        if (isCurrentQuiz && units[i].video?.questions?.length > 0) {
          progressCount += 2;
        } else {
          progressCount += 1;
        }
        break; // Stop counting after current unit
      }
    }
    
    // Subtract 1 from progressCount to align with current position
    return `${((progressCount - 1) * 100) / (totalIndicators - 1)}%`;
  };

  const progressPercentage = calculateProgressPercentage();

  return (
    <div className="fixed left-5 sm:left-12 inset-y-0 flex flex-col items-center z-20">
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
            
            // Calculate positions for both video and quiz indicators
            let indicatorCount = 0;
            for (let i = 0; i < index; i++) {
              indicatorCount += units[i].video?.questions?.length > 0 ? 2 : 1;
            }
            
            const videoPosition = `${(indicatorCount * 100) / (totalIndicators - 1)}%`;
            const quizPosition = `${((indicatorCount + 1) * 100) / (totalIndicators - 1)}%`;
            
            const isPastUnit = index < currentUnitIndex || (index === currentUnitIndex && isCurrentQuiz);
            
            return (
              <div key={unit.id}>
                {/* Video diamond */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ top: videoPosition }}
                >
                  <div
                    className={`
                      w-2 h-2 sm:w-3 sm:h-3 transform rotate-45 cursor-pointer
                      ${isCurrentUnit && !isCurrentQuiz
                        ? 'bg-white border-[1.5px] sm:border-2 border-secondary' 
                        : isPastUnit
                          ? 'bg-secondary'
                          : 'bg-zinc-400 hover:bg-secondary'
                      }
                      transition-colors duration-200
                    `}
                    onClick={() => handleUnitClick(unit.id, 'video')}
                    onMouseEnter={() => setHoveredUnit(unit.id)}
                    onMouseLeave={() => setHoveredUnit(null)}
                  />
                  
                  {/* Video tooltip */}
                  {hoveredUnit === unit.id && (
                    <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-secondary/90 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap">
                      {unit.title || `Unit ${index + 1}`}
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
                        w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full cursor-pointer
                        ${isCurrentUnit && isCurrentQuiz
                          ? 'bg-white border-[1.5px] sm:border-2 border-secondary' 
                          : isPastUnit
                            ? 'bg-secondary'
                            : 'bg-zinc-400 hover:bg-secondary'
                        }
                        transition-colors duration-200
                      `}
                      onClick={() => handleUnitClick(unit.id, 'quiz')}
                      onMouseEnter={() => setHoveredUnit(`${unit.id}-quiz`)}
                      onMouseLeave={() => setHoveredUnit(null)}
                    />
                    
                    {/* Quiz tooltip */}
                    {hoveredUnit === `${unit.id}-quiz` && (
                      <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-secondary/90 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap">
                        {unit.title ? `${unit.title} Quiz` : `Unit ${index + 1} Quiz`}
                      </div>
                    )}
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