'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionWrapperProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical';
}

export function MotionWrapper({ children, direction = 'horizontal' }: MotionWrapperProps) {
  const variants = {
    horizontal: {
      initial: { opacity: 0, x: -300 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 300 },
    },
    vertical: {
      initial: { opacity: 0, y: 300 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -300 },
    },
  };

  return (
    <motion.div
      variants={variants[direction]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="h-screen w-full flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
} 