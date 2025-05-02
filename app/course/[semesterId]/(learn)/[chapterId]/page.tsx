"use client";

import courseData from "@/app/_components/(semester1)/courseData";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useProgress } from "@/app/_components/ProgressClient";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { ViewTransitions } from 'next-view-transitions';
import { useTransitionRouter } from 'next-view-transitions';
import { toast } from 'sonner';
import { Lock, Unlock } from 'lucide-react';

// Helper function to check if a unit is complete
const isUnitComplete = (unitId: string, progressData: any): boolean => {
  if (!progressData?.unitProgress) return false;
  const unitProgress = progressData.unitProgress.find((up: any) => up.unitId === unitId);
  if (!unitProgress) return false;

  // Find the unit data to check if it has questions
  const unit = courseData.flatMap(s => s.chapters.flatMap(c => c.units)).find(u => u.id === unitId);
  const hasQuestions = (unit?.video?.questions?.length || 0) > 0;
  const questionsCompleted = unitProgress.questionsCompleted || 0;
  const videoCompleted = unitProgress.videoCompleted || false;

  // Complete if video watched and (quiz done or no quiz exists)
  return videoCompleted && (!hasQuestions || questionsCompleted >= (unit?.video?.questions?.length || 0));
};

export default function ChapterPage() {
  const { semesterId, chapterId } = useParams();
  const { progress: progressData } = useProgress();
  const [isChronologicalMode, setIsChronologicalMode] = useState(true);
  const toggleChronologicalMode = () => setIsChronologicalMode(prev => !prev);
  
  const router = useTransitionRouter();
  const count = useMotionValue(0);
  const roundedCount = useTransform(count, value => `${Math.round(value)}%`);
  
  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === chapterId);

  // Calculate chapter progress
  const calculateChapterProgress = () => {
    if (!chapter || !progressData || !semesterId) return 0;
    
    let totalUnits = 0;
    let completedUnits = 0;

    const semesterUnitIds = new Set(
      semester?.chapters.flatMap(ch => ch.units.map(u => u.id)) || []
    );

    chapter.units.forEach(unit => {
      const unitProgressData = progressData.unitProgress?.find(up => 
        up.unitId === unit.id && semesterUnitIds.has(unit.id)
      );
      
      if (unitProgressData) {
        totalUnits++;
        if (isUnitComplete(unit.id, progressData)) {
          completedUnits++;
        }
      } else {
        totalUnits++;
      }
    });

    return totalUnits === 0 ? 0 : Math.min(100, Math.round((completedUnits / totalUnits) * 100));
  };

  const progress = calculateChapterProgress();

  // Animate the count when progress changes
  useEffect(() => {
    const animation = animate(count, progress, {
      duration: 1.5,
      ease: "easeOut"
    });

    return animation.stop;
  }, [progress, count]);

  if (!chapter) {
    return <div className="text-white">Chapter not found</div>;
  }

  // Function to check if a specific unit link should be locked
  const isUnitLocked = (unitIndex: number): boolean => {
    if (!isChronologicalMode) return false; // Always unlocked if mode is off
    if (unitIndex === 0) return false; // First unit is always unlocked

    // Check completion of all *previous* units
    for (let i = 0; i < unitIndex; i++) {
      const previousUnit = chapter.units[i];
      if (!isUnitComplete(previousUnit.id, progressData)) {
        return true; // Found an incomplete previous unit
      }
    }
    return false; // All previous units are complete
  };

  // Custom transition logic (remains the same)
  const handleLinkClick = (e: React.MouseEvent, url: string) => {
      e.preventDefault();
      router.push(url, {
        onTransitionReady: () => {
          document.documentElement.animate(
            [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }],
            { duration: 1000, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards", pseudoElement: "::view-transition-old(content)" }
          );
          document.documentElement.animate(
            [{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
            { duration: 1000, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards", pseudoElement: "::view-transition-new(content)" }
          );
        }
      });
  };

  return (
    <div className="relative min-h-screen">
      {/* Static Background and Progress */}
      <div className="fixed inset-0 z-0">
        {/* Progress Percentage */}
        <div className="absolute right-0 top-10 opacity-50">
          <motion.div className="font-neima text-[12rem] font-light text-secondary">
            {roundedCount}
          </motion.div>
        </div>
      </div>

      {/* Content with View Transition */}
      <div className="relative z-10 text-white font-morion p-8 max-w-6xl mx-auto pt-32">
        <h1 className='font-neima text-7xl font-light mb-6 text-white relative z-10'>
          {chapter.title}
        </h1>
        
        {/* Instructor Info */}
        {chapter.instructor && (
          <div className="flex items-center mb-8 space-x-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src={chapter.instructor.profileImage}
                alt={chapter.instructor.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-secondary text-sm">Instructor</p>
              <h3 className="text-white font-light">{chapter.instructor.name}</h3>
            </div>
          </div>
        )}

        <p className="text-gray-300 mb-12 font-light">{chapter.description}</p>

        <h2 className="text-2xl font-semibold mb-6 text-secondary">Units:</h2>
        <div className="space-y-4">
          {chapter.units.map((unit, index) => {
            const locked = isUnitLocked(index);
            const url = `/course/${semesterId}/${chapterId}/${unit.id}`;

            return (
              <div 
                key={unit.id} 
                onClick={(e) => {
                  if (locked) {
                    toast.info('Please complete previous units first.');
                  } else {
                    handleLinkClick(e, url);
                  }
                }}
                className={`group flex items-center justify-between p-4 rounded-lg border transition-all duration-300 
                         ${locked 
                           ? 'border-white/10 bg-black/10 cursor-not-allowed opacity-60' 
                           : 'border-white/10 hover:border-white/20 bg-black/20 cursor-pointer'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <svg className={`w-6 h-6 ${locked ? 'text-secondary/50' : 'text-secondary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-xl font-light transition-colors ${locked ? 'text-white/60' : 'group-hover:text-secondary text-white'}`}>
                      {unit.title}
                    </h3>
                    {unit.description && (
                      <p className={`text-sm font-light ${locked ? 'text-white/50' : 'text-white/70'}`}>
                        {unit.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {unit.video?.questions && (
                    <span className={`flex items-center text-sm ${locked ? 'text-white/40' : 'text-white/60'}`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Quiz
                    </span>
                  )}
                  {/* Show Lock or Arrow */}
                  {locked ? (
                     <Lock size={20} className="text-white/40" />
                   ) : (
                     <svg className="w-5 h-5 text-white/40 group-hover:text-secondary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 