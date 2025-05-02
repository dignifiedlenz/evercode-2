"use client";

import { useEffect, useState } from "react";
import { motion, useTransform, useSpring } from "framer-motion";
import VideoPlayer from "./video/page";
import Quiz from "./quiz/page";
import { useParams, usePathname } from "next/navigation";

export default function UnitPage() {
  const [scrollProgress, setScrollProgress] = useState(0.5);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { unitId } = useParams();
  const pathname = usePathname();
  const currentSection = pathname.includes('/quiz') ? 'quiz' : 'video';

  // Transform scroll progress to content position and opacity
  const contentY = useTransform(
    useSpring(scrollProgress, {
      stiffness: 100,
      damping: 30,
      mass: 1
    }),
    [0, 0.5, 1],
    ["100%", "0%", "-100%"]
  );

  const contentOpacity = useTransform(
    useSpring(scrollProgress, {
      stiffness: 100,
      damping: 30,
      mass: 1
    }),
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  const handleUpClick = () => {
    setIsTransitioning(true);
    // The actual navigation will be handled by ScrollNavigator
  };

  const handleDownClick = () => {
    setIsTransitioning(true);
    // The actual navigation will be handled by ScrollNavigator
  };

  const handleScrollProgressChange = (progress: number) => {
    setScrollProgress(progress);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {currentSection === 'video' ? (
        <motion.div
          style={{
            y: contentY,
            opacity: contentOpacity,
          }}
          className="w-full h-full"
        >
          <VideoPlayer />
        </motion.div>
      ) : (
        <motion.div
          style={{
            y: contentY,
            opacity: contentOpacity,
          }}
          className="w-full h-full"
        >
          <Quiz />
        </motion.div>
      )}

    </div>
  );
} 