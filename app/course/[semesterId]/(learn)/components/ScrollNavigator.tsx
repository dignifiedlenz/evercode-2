"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import Image from "next/image";

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
    <div className="fixed right-8 top-1/2 -translate-y-1/2 h-72 flex flex-col items-center">
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
