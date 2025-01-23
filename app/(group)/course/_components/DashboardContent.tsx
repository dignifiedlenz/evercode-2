// src/app/_components/DashboardContent.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress"; // Ensure this path is correct
import { ParallaxProvider } from '@/components/ui/ParrallaxLayout';
import ParallaxItem from '@/components/ui/ParallaxItem';
import Link from 'next/link';

interface DashboardContentProps {
  nextUnitTitle: string;
  nextUnitChapterTitle: string;
  resumeCourseLink: string;
  allUnitsCompleted: boolean;
  progressPercentage: number;
  lastCompletedUnitDisplay: string;
  lastCompletedChapterDisplay: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Delay between each child animation
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8, // Increased duration for a slower animation
      ease: "easeOut", // Easing function for a smoother start
    },
  },
};

const DashboardContent: React.FC<DashboardContentProps> = ({
  nextUnitTitle,
  nextUnitChapterTitle,
  resumeCourseLink,
  allUnitsCompleted,
  progressPercentage,
}) => {
  return (
    <ParallaxProvider>
    <motion.div
      className="w-full md:w-3/4 lg:w-1/2 h-fit px-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Back Message */}
      <motion.h1
        className="text-4xl md:text-6xl font-custom1 mb-4"
        variants={itemVariants}
      >
        Welcome Back!
      </motion.h1>

      {/* Next Unit Introduction */}
      <motion.p
        className="text-sm md:text-xl mt-10 font-custom2"
        variants={itemVariants}
      >
        Your next unit is waiting for you:
      </motion.p>
      
      {/* Next Unit Display with Chapter Name */}
      <motion.div className="mb-10" variants={itemVariants}>
        {nextUnitChapterTitle && (
          <p className="text-sm md:text-lg text-gray-300">{nextUnitChapterTitle}</p>
        )}
        <p className="text-xl md:text-3xl font-custom1">
          <strong>{nextUnitTitle}</strong>
        </p>
      </motion.div>


      {/* Resume Course Button */}
      {!allUnitsCompleted && (
        <motion.div variants={itemVariants}>
          <Link
            href={resumeCourseLink}
            className="bg-secondary hover:bg-secondary-foreground text-black my-10 px-4 py-4 rounded hover:px-7 transition-all"
            aria-label="Resume your course"
          >
            Resume Course
          </Link>
        </motion.div>
      )} 

    <ParallaxItem>
      {/* All Units Completed Message */}
      {allUnitsCompleted && (
        <motion.p
          className="bg-secondary-foreground text-black my-10 px-4 py-4 rounded"
          variants={itemVariants}
        >
          🎉 Congratulations! You have completed all units in the course.
        </motion.p>
      )}
    </ParallaxItem>

    <ParallaxItem speed={0.3}>
      {/* Progress Section */}
      <motion.div
        className="py-20 w-3/4 max-w-lg"
        variants={itemVariants}
      >
        <p className="font-custom1 text-white text-3xl">Your Progress</p>
        <Progress value={progressPercentage} className="mt-3 h-2 [&>div]:bg-secondary-foreground bg-white" />
        <p className="text-sm mt-2">{progressPercentage.toFixed(0)}% Complete</p>
      </motion.div>
      </ParallaxItem>
     
    </motion.div>
    </ParallaxProvider>
  );
};

export default DashboardContent;
