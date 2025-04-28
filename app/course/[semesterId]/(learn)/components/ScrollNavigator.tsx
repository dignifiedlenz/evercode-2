"use client";

import { useEffect, useState, useRef, useCallback, TouchEvent } from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import Image from "next/image";
import { useRouter, useParams } from 'next/navigation';
import courseData from '@/app/_components/(semester1)/courseData';
import { useChronologicalMode } from '@/app/context/ChronologicalModeContext';
import { useProgress, UnitProgress as HookUnitProgress } from '@/app/_components/ProgressClient';
import { toast } from 'sonner';

interface ScrollNavigatorProps {
  onUpClick: () => void;
  onDownClick: () => void;
  upLabel?: string;
  downLabel?: string;
  threshold?: number;
  currentSection?: 'video' | 'quiz';
  onScrollProgressChange?: (progress: number) => void;
}

export default function ScrollNavigator({
  onUpClick,
  onDownClick,
  upLabel = "Previous",
  downLabel = "Next",
  threshold = 0.75,
  currentSection = 'video',
  onScrollProgressChange
}: ScrollNavigatorProps) {
  const params = useParams();
  const semesterId = params.semesterId as string;
  const chapterId = params.chapterId as string;
  const unitId = params.unitId as string;
  
  console.log('ScrollNavigator rendered with:', { 
    currentSection, 
    threshold,
    semesterId,
    chapterId,
    unitId
  });

  const [progress, setProgress] = useState(0.5);
  const [reachedThreshold, setReachedThreshold] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const lastDirection = useRef<"up" | "down" | null>(null);
  const accumulatedDelta = useRef(0);
  const maxDelta = 800; // Threshold to trigger navigation
  const isAnimating = useRef(false);
  const lastWheelTime = useRef(Date.now());
  const wheelTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const scrollVelocityRef = useRef(0);
  const router = useRouter();
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const minSwipeDistance = 50; // minimum swipe distance in pixels
  const { isChronologicalMode } = useChronologicalMode();
  const { progress: progressData, loading: isLoadingProgress } = useProgress();
  
  const scrollProgress = useSpring(0.5, {
    stiffness: 1000,
    damping: 50,
    mass: 0.1,
    restDelta: 0.001,
    velocity: scrollVelocityRef.current
  });

  const indicatorY = useTransform(scrollProgress, [0, 1], [0, 100]);

  useEffect(() => {
    if (onScrollProgressChange) {
      onScrollProgressChange(progress);
    }
  }, [progress, onScrollProgressChange]);

  useEffect(() => {
     console.log('ScrollNavigator: Progress Data Updated', { 
         isLoadingProgress, 
         hasData: !!progressData, 
         unitCount: progressData?.unitProgress?.length 
     });
  }, [progressData, isLoadingProgress]);

  const canNavigate = (direction: 'up' | 'down'): boolean => {
    if (!isChronologicalMode) return true;
    if (isLoadingProgress) return false;
    if (!progressData) {
      console.warn("Cannot check navigation: No progress data available.");
      return false;
    }

    const semester = courseData.find(sem => sem.id === semesterId);
    if (!semester) return false;

    const chapter = semester.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return false;

    const currentUnitIndex = chapter.units.findIndex(u => u.id === unitId);
    if (currentUnitIndex === -1) return false;

    if (direction === 'down') {
      const currentUnit = chapter.units[currentUnitIndex];
      const currentUnitProgress = progressData.unitProgress?.find((up: HookUnitProgress) => up.unitId === currentUnit.id);
      const hasQuestions = currentUnit.video?.questions?.length > 0;
      
      if (currentSection === 'video') {
         const videoCompleted = currentUnitProgress?.videoCompleted === true;
         console.log('[Chronological Check] Video -> Quiz/Next: Video completed?', videoCompleted);
         if (!videoCompleted) {
            toast.error("Complete the video before proceeding.", { position: 'bottom-center' });
            return false;
         }
         if (!hasQuestions) {
             if (currentUnitIndex < chapter.units.length - 1) {
               return true; 
             } else {
               const chapterIndex = semester.chapters.findIndex(ch => ch.id === chapterId);
               return chapterIndex < semester.chapters.length - 1;
             }
         }
         return true; 
      } else {
         const videoCompleted = currentUnitProgress?.videoCompleted === true;
         const totalQuestions = currentUnitProgress?.totalQuestions ?? 5;
         const quizCompleted = !!currentUnitProgress?.questionsCompleted && currentUnitProgress.questionsCompleted >= totalQuestions;
         const isCurrentUnitComplete = videoCompleted && quizCompleted;
         console.log('[Chronological Check] Quiz -> Next: Current unit complete?', { videoCompleted, quizCompleted, totalQuestions, isComplete: isCurrentUnitComplete });

         if (!isCurrentUnitComplete) {
            toast.error("Complete the quiz before proceeding.", { position: 'bottom-center' });
            return false;
         }

         if (currentUnitIndex < chapter.units.length - 1) {
            return true;
         }

         const chapterIndex = semester.chapters.findIndex(ch => ch.id === chapterId);
         return chapterIndex < semester.chapters.length - 1;
      }
    } else {
      return true;
    }
  };

  const navigateToAdjacentUnit = (direction: 'next' | 'prev') => {
    console.log('Attempting navigation:', direction);
    const semester = courseData.find(sem => sem.id === semesterId);
    if (!semester) return;
    
    const chapterIndex = semester.chapters.findIndex(ch => ch.id === chapterId);
    if (chapterIndex === -1) return;
    
    const currentChapter = semester.chapters[chapterIndex];
    const unitIndex = currentChapter.units.findIndex(u => u.id === unitId);
    if (unitIndex === -1) return;
    
    let targetUrl = '';

    if (direction === 'next') {
      if (currentSection === 'video' && currentChapter.units[unitIndex].video?.questions?.length > 0) {
        targetUrl = `/course/${semesterId}/${chapterId}/${unitId}/quiz`;
        console.log('Navigating video -> quiz:', targetUrl);
      } else if (unitIndex < currentChapter.units.length - 1) {
        const nextUnit = currentChapter.units[unitIndex + 1];
        targetUrl = `/course/${semesterId}/${chapterId}/${nextUnit.id}/video`;
        console.log('Navigating quiz -> next unit video:', targetUrl);
      } else if (chapterIndex < semester.chapters.length - 1) {
        const nextChapter = semester.chapters[chapterIndex + 1];
        if (nextChapter.units.length > 0) {
          const firstUnit = nextChapter.units[0];
          targetUrl = `/course/${semesterId}/${nextChapter.id}/${firstUnit.id}/video`;
          console.log('Navigating last unit -> next chapter video:', targetUrl);
        } else {
           console.log("Next chapter has no units.");
        }
      } else {
          console.log("Already at the last unit of the last chapter.");
      }
    } else {
      if (currentSection === 'quiz') {
        targetUrl = `/course/${semesterId}/${chapterId}/${unitId}/video`;
        console.log('Navigating quiz -> video:', targetUrl);
      } else if (unitIndex > 0) {
        const prevUnit = currentChapter.units[unitIndex - 1];
        const section = prevUnit.video?.questions?.length > 0 ? 'quiz' : 'video';
        targetUrl = `/course/${semesterId}/${chapterId}/${prevUnit.id}/${section}`;
        console.log(`Navigating video -> prev unit ${section}:`, targetUrl);
      } else if (chapterIndex > 0) {
        const prevChapter = semester.chapters[chapterIndex - 1];
        if (prevChapter.units.length > 0) {
          const lastUnit = prevChapter.units[prevChapter.units.length - 1];
          const section = lastUnit.video?.questions?.length > 0 ? 'quiz' : 'video';
          targetUrl = `/course/${semesterId}/${prevChapter.id}/${lastUnit.id}/${section}`;
          console.log(`Navigating first unit -> prev chapter last unit ${section}:`, targetUrl);
        } else {
            console.log("Previous chapter has no units.");
        }
      } else {
          console.log("Already at the first unit of the first chapter.");
      }
    }

    if (targetUrl) {
       router.push(targetUrl);
    }
  };

  const handleScrollUp = () => {
    if (canNavigate('up')) {
      onUpClick ? onUpClick() : navigateToAdjacentUnit('prev');
    }
  };

  const handleScrollDown = () => {
    if (canNavigate('down')) {
      onDownClick ? onDownClick() : navigateToAdjacentUnit('next');
    }
  };

  const updateProgress = (deltaY: number) => {
    if (isAnimating.current || isScrollLocked) return;

    const sensitivity = 0.0015;
    let newProgress = progress - deltaY * sensitivity;
    newProgress = Math.max(0, Math.min(1, newProgress));

    setProgress(newProgress);
    scrollProgress.set(newProgress);

    if (newProgress <= 1 - threshold && lastDirection.current !== "up") {
        console.log("UP Threshold Reached");
        setReachedThreshold(true);
        lastDirection.current = "up";
        handleScrollUp();
        lockScrollTemporarily();
    } else if (newProgress >= threshold && lastDirection.current !== "down") {
        console.log("DOWN Threshold Reached");
        setReachedThreshold(true);
        lastDirection.current = "down";
        handleScrollDown(); 
        lockScrollTemporarily();
    } else if (newProgress > 1 - threshold && newProgress < threshold) {
        setReachedThreshold(false);
        lastDirection.current = null;
    }
  };

  const lockScrollTemporarily = () => {
    setIsScrollLocked(true);
    isAnimating.current = true;
    animate(scrollProgress, 0.5, {
        type: "spring",
        stiffness: 100,
        damping: 20,
        onComplete: () => {
            isAnimating.current = false;
            setIsScrollLocked(false);
            setProgress(0.5);
            lastDirection.current = null; 
            setReachedThreshold(false);
        }
    });
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    accumulatedDelta.current = 0;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isAnimating.current || isScrollLocked) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = touchStartY.current - currentY;
    const deltaX = touchStartX.current - currentX;

    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
        e.preventDefault();
        accumulatedDelta.current += deltaY;
        updateProgress(deltaY);
        touchStartY.current = currentY;
        touchStartX.current = currentX;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isAnimating.current || isScrollLocked) return;

    if (!reachedThreshold) {
        isAnimating.current = true;
        animate(scrollProgress, 0.5, {
            type: "spring",
            stiffness: 100,
            damping: 20,
            onComplete: () => {
                isAnimating.current = false;
                setProgress(0.5);
            }
        });
    }
    accumulatedDelta.current = 0;
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        updateProgress(e.deltaY);
    };

    const element = document.documentElement;
    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('touchstart', handleTouchStart as any, { passive: false });
    element.addEventListener('touchmove', handleTouchMove as any, { passive: false });
    element.addEventListener('touchend', handleTouchEnd as any, { passive: false });

    return () => {
        element.removeEventListener('wheel', handleWheel);
        element.removeEventListener('touchstart', handleTouchStart as any);
        element.removeEventListener('touchmove', handleTouchMove as any);
        element.removeEventListener('touchend', handleTouchEnd as any);
    };
  }, [progress, reachedThreshold, isScrollLocked, isAnimating.current, isChronologicalMode, progressData, isLoadingProgress]);

  return (
    <div className="fixed right-5 sm:right-12 inset-y-0 flex flex-col items-center justify-center z-50 pointer-events-none">
      <motion.button
        onClick={handleScrollUp}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="pointer-events-auto mb-4 p-2 rounded-full text-white/50 hover:text-white/80 transition-colors"
        aria-label={upLabel}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: indicatorY.get() < 50 ? 1 : 0.5, y: 0 }}
        transition={{ duration: 0.3 }}
      >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.25 14.75L12 8.5L5.75 14.75"></path>
          </svg>
          <span className="sr-only">{upLabel}</span>
      </motion.button>

      <div className="h-32 w-[2px] bg-white/20 rounded-full relative overflow-hidden">
        <motion.div
          className="absolute left-0 w-full h-full bg-white origin-bottom"
          style={{
            scaleY: useTransform(indicatorY, [0, 100], [0, 1]),
            top: useTransform(indicatorY, [0, 100], [100, 0], { clamp: false }) + '%',
            height: '100%'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <motion.button
        onClick={handleScrollDown}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="pointer-events-auto mt-4 p-2 rounded-full text-white/50 hover:text-white/80 transition-colors"
        aria-label={downLabel}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: indicatorY.get() > 50 ? 1 : 0.5, y: 0 }}
        transition={{ duration: 0.3 }}
      >
         <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.75 9.75L12 16L18.25 9.75"></path>
          </svg>
         <span className="sr-only">{downLabel}</span>
      </motion.button>
    </div>
  );
} 
