"use client";

import { useEffect, useState, useRef, useCallback, TouchEvent } from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import Image from "next/image";
import { useRouter, useParams } from 'next/navigation';
import courseData from '@/app/_components/(semester1)/courseData';

interface ScrollNavigatorProps {
  onUpClick: () => void;
  onDownClick: () => void;
  upLabel?: string;
  downLabel?: string;
  threshold?: number;
  currentSection?: 'video' | 'quiz';
}

export default function ScrollNavigator({
  onUpClick,
  onDownClick,
  upLabel = "Previous",
  downLabel = "Next",
  threshold = 0.75,
  currentSection = 'video'
}: ScrollNavigatorProps) {
  const [progress, setProgress] = useState(0.5);
  const [reachedThreshold, setReachedThreshold] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const lastDirection = useRef<"up" | "down" | null>(null);
  const accumulatedDelta = useRef(0);
  const maxDelta = 800;
  const isAnimating = useRef(false);
  const lastWheelTime = useRef(Date.now());
  const wheelTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const scrollVelocityRef = useRef(0);
  const router = useRouter();
  const { semesterId, chapterId, unitId } = useParams();
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const minSwipeDistance = 50; // minimum swipe distance in pixels
  
  // Smooth scroll progress with immediate response
  const scrollProgress = useSpring(0.5, {
    stiffness: 1000, // Much higher stiffness for immediate response
    damping: 50,     // Higher damping to prevent oscillation
    mass: 0.1,       // Lower mass for faster response
    restDelta: 0.001,
    velocity: scrollVelocityRef.current
  });

  // Transform progress to indicator position (0-100%)
  const indicatorY = useTransform(scrollProgress, [0, 1], [0, 100]);

  // Improved navigation logic with detailed logging
  const navigateToAdjacentUnit = (direction: 'next' | 'prev') => {
    // 1. Find the current semester
    console.log('Current params:', { semesterId, chapterId, unitId });
    console.log('Course data available:', !!courseData);
    
    const semester = courseData.find(sem => sem.id === semesterId);
    if (!semester) {
      console.error('Semester not found:', semesterId);
      return;
    }
    
    // 2. Find the current chapter and its index
    console.log('Chapters in semester:', semester.chapters.length);
    const chapterIndex = semester.chapters.findIndex(ch => ch.id === chapterId);
    if (chapterIndex === -1) {
      console.error('Chapter not found:', chapterId);
      return;
    }
    
    const currentChapter = semester.chapters[chapterIndex];
    console.log('Current chapter:', currentChapter.title, 'with', currentChapter.units.length, 'units');
    
    // 3. Find the current unit and its index
    const unitIndex = currentChapter.units.findIndex(u => u.id === unitId);
    if (unitIndex === -1) {
      console.error('Unit not found:', unitId);
      return;
    }
    
    console.log('Current unit index:', unitIndex);
    
    // 4. Determine target based on direction
    if (direction === 'next') {
      if (unitIndex < currentChapter.units.length - 1) {
        // Next unit in same chapter
        const nextUnit = currentChapter.units[unitIndex + 1];
        const unitType = determineUnitType(nextUnit);
        
        console.log('Navigating to next unit in same chapter:', nextUnit.id, unitType);
        router.push(`/course/${semesterId}/${chapterId}/${nextUnit.id}/${unitType}`);
      } else if (chapterIndex < semester.chapters.length - 1) {
        // First unit of next chapter
        const nextChapter = semester.chapters[chapterIndex + 1];
        if (nextChapter.units.length > 0) {
          const firstUnit = nextChapter.units[0];
          const unitType = determineUnitType(firstUnit);
          
          console.log('Navigating to first unit of next chapter:', nextChapter.id, firstUnit.id, unitType);
          router.push(`/course/${semesterId}/${nextChapter.id}/${firstUnit.id}/${unitType}`);
        }
      }
    } else {
      // Previous direction
      if (unitIndex > 0) {
        // Previous unit in same chapter
        const prevUnit = currentChapter.units[unitIndex - 1];
        const unitType = determineUnitType(prevUnit);
        
        console.log('Navigating to previous unit in same chapter:', prevUnit.id, unitType);
        router.push(`/course/${semesterId}/${chapterId}/${prevUnit.id}/${unitType}`);
      } else if (chapterIndex > 0) {
        // Last unit of previous chapter
        const prevChapter = semester.chapters[chapterIndex - 1];
        if (prevChapter.units.length > 0) {
          const lastUnit = prevChapter.units[prevChapter.units.length - 1];
          const unitType = determineUnitType(lastUnit);
          
          console.log('Navigating to last unit of previous chapter:', prevChapter.id, lastUnit.id, unitType);
          router.push(`/course/${semesterId}/${prevChapter.id}/${lastUnit.id}/${unitType}`);
        }
      }
    }
  };
  
  // Helper function to determine the unit type (video or quiz)
  const determineUnitType = (unit: any): string => {
    // Check various possible structures based on your courseData format
    if (unit.type) {
      return unit.type; // If unit has an explicit type property
    } else if (unit.video) {
      return 'video';
    } else if (unit.quiz || unit.questions) {
      return 'quiz';
    } else if (unit.content_type) {
      return unit.content_type.toLowerCase();
    } else {
      // Fallback to default type
      console.warn('Could not determine unit type, defaulting to video', unit);
      return 'video';
    }
  };
  
  const handleScrollUp = () => {
    navigateToAdjacentUnit('prev');
  };
  
  const handleScrollDown = () => {
    navigateToAdjacentUnit('next');
  };

  // Function to snap back to middle immediately
  const snapToMiddle = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    accumulatedDelta.current = 0;
    setProgress(0.5);
    scrollVelocityRef.current = 0;
    
    // Immediate snap animation
    animate(scrollProgress, 0.5, {
      type: "spring",
      stiffness: 1000,
      damping: 50,
      mass: 0.1,
      restDelta: 0.001,
      velocity: 0,
      onComplete: () => {
        isAnimating.current = false;
      }
    });
  }, [scrollProgress]);

  // Function to handle page transition
  const handlePageTransition = useCallback((direction: "up" | "down") => {
    setIsScrollLocked(true);
    if (direction === "up") {
      onUpClick();
    } else {
      onDownClick();
    }
    snapToMiddle();
    
    // Unlock scrolling after 1 second
    setTimeout(() => {
      setIsScrollLocked(false);
    }, 1000);
  }, [onUpClick, onDownClick, snapToMiddle]);

  // Add touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (isAnimating.current || isScrollLocked) return;
    
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isAnimating.current || isScrollLocked) return;
    
    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;
    
    // Calculate deltas
    const deltaY = touchStartY.current - touchY;
    const deltaX = touchStartX.current - touchX;
    
    // Only proceed if vertical swipe is more significant than horizontal
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      e.preventDefault(); // Prevent default scrolling
      
      // Convert touch movement to scroll delta (similar to wheel event)
      accumulatedDelta.current = Math.max(
        -maxDelta,
        Math.min(maxDelta, deltaY * 2)
      );
      
      // Convert accumulated delta to progress (0-1)
      const newProgress = (accumulatedDelta.current + maxDelta) / (maxDelta * 2);
      setProgress(newProgress);
      scrollProgress.set(newProgress);
      
      // Check threshold
      const hasReachedThreshold = newProgress > 0.85 || newProgress < 0.15;
      setReachedThreshold(hasReachedThreshold);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isAnimating.current || isScrollLocked) return;
    
    const touchY = e.changedTouches[0].clientY;
    const touchX = e.changedTouches[0].clientX;
    
    const deltaY = touchStartY.current - touchY;
    const deltaX = touchStartX.current - touchX;
    
    // Only trigger if vertical swipe is more significant than horizontal
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) >= minSwipeDistance) {
      const direction = deltaY > 0 ? "down" : "up";
      handlePageTransition(direction);
    } else {
      // If swipe wasn't long enough, snap back to middle
      snapToMiddle();
    }
  };

  // Add touch event listeners
  useEffect(() => {
    const element = document.documentElement;
    
    element.addEventListener("touchstart", handleTouchStart as any, { passive: false });
    element.addEventListener("touchmove", handleTouchMove as any, { passive: false });
    element.addEventListener("touchend", handleTouchEnd as any, { passive: false });
    
    return () => {
      element.removeEventListener("touchstart", handleTouchStart as any);
      element.removeEventListener("touchmove", handleTouchMove as any);
      element.removeEventListener("touchend", handleTouchEnd as any);
    };
  }, [handlePageTransition, snapToMiddle, isScrollLocked]);

  useEffect(() => {
    let lastDelta = 0;
    let lastTime = Date.now();

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isAnimating.current || isScrollLocked) return;
      
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Calculate scroll velocity
      const currentDelta = e.deltaY;
      scrollVelocityRef.current = (currentDelta - lastDelta) / Math.max(deltaTime, 1);
      lastDelta = currentDelta;
      
      // Clear existing timeout
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      
      // Accumulate the delta with velocity influence
      accumulatedDelta.current = Math.max(
        -maxDelta,
        Math.min(maxDelta, accumulatedDelta.current + e.deltaY)
      );
      
      // Convert accumulated delta to progress (0-1)
      const newProgress = (accumulatedDelta.current + maxDelta) / (maxDelta * 2);
      setProgress(newProgress);
      scrollProgress.set(newProgress);
      lastWheelTime.current = currentTime;

      // Check if we've reached the threshold
      const hasReachedThreshold = newProgress > 0.85 || newProgress < 0.15;
      setReachedThreshold(hasReachedThreshold);

      if (hasReachedThreshold) {
        const direction = newProgress > 0.5 ? "down" : "up";
        if (direction !== lastDirection.current) {
          lastDirection.current = direction;
          handlePageTransition(direction);
        }
      } else {
        lastDirection.current = null;
        // Set timeout to check for inactivity - shorter delay
        wheelTimeoutRef.current = setTimeout(() => {
          if (Math.abs(scrollVelocityRef.current) < 0.1) {
            snapToMiddle();
          }
        }, 50); // Much shorter timeout for immediate response
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, [scrollProgress, handlePageTransition, snapToMiddle, isScrollLocked]);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 h-72 flex flex-col items-center touch-none">
      <div className="flex flex-col items-center h-full justify-between">
        {/* Up Arrow */}
        <button 
          onClick={() => !isScrollLocked && handlePageTransition("up")}
          className="flex items-center justify-center h-10 mb-2 text-white/70 hover:text-white transition-colors"
          aria-label={currentSection === 'video' ? 'Previous' : 'Video'}
          disabled={isScrollLocked}
        >
          <Image 
            src="/EvermodeArrow.svg" 
            alt="Up" 
            width={24} 
            height={10} 
            className="transform -rotate-90"
          />
        </button>

        {/* Line Markers */}
        <div className="relative min-h-40 w-6 flex flex-col justify-evenly">
          {Array(7).fill(0).map((_, i) => (
            <div 
              key={i}
              className="w-6 h-[1px] bg-white/30"
            />
          ))}

          {/* Moving Indicator Line */}
          <motion.div
            className={`absolute left-0 w-6 h-[2px] ${
              reachedThreshold ? "bg-secondary" : "bg-white"
            }`}
            style={{ 
              top: `${indicatorY.get()}%`, 
              transform: 'translateY(-50%)',
            }}
          />
        </div>

        {/* Down Arrow */}
        <button
          onClick={() => !isScrollLocked && handlePageTransition("down")}
          className="flex items-center justify-center h-10 mt-2 text-white/70 hover:text-white transition-colors"
          aria-label={currentSection === 'video' ? 'Quiz' : 'Next'}
          disabled={isScrollLocked}
        >
          <Image 
            src="/EvermodeArrow.svg" 
            alt="Down" 
            width={24} 
            height={10}
            className="transform rotate-90"
          />
        </button>
      </div>
    </div>
  );
} 
