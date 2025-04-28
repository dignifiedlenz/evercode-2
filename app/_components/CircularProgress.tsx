"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  max: number;
  label: string;
  color?: string;
}

export default function CircularProgress({ value, max, label, color = 'secondary' }: CircularProgressProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const percentage = (value / max) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = offset.toString();
    }
  }, [offset]);

  return (
    <div className="flex flex-col items-center gap-1 min-w-24">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-white/5"
          />
          {/* Progress circle */}
          <circle
            ref={circleRef}
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className={`text-${color} transition-all duration-500`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
                className="text-xl font-neima text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {value}/{max}
            </motion.span>
        </div>
      </div>
      <motion.span 
        className="text-xs font-morion text-zinc-300 mt-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {label}
      </motion.span>
    </div>
  );
} 