'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import courseData from "@/app/_components/(semester1)/courseData";

const getPreviousUnitId = (currentUnitId: string): string | null => {
  for (const semester of courseData) {
    for (const chapter of semester.chapters) {
      const unitIndex = chapter.units.findIndex(u => u.id === currentUnitId);
      if (unitIndex > 0) return chapter.units[unitIndex - 1].id;
    }
  }
  return null;
};

const getNextUnitId = (currentUnitId: string): string | null => {
  for (const semester of courseData) {
    for (const chapter of semester.chapters) {
      const unitIndex = chapter.units.findIndex(u => u.id === currentUnitId);
      if (unitIndex >= 0 && unitIndex < chapter.units.length - 1) return chapter.units[unitIndex + 1].id;
    }
  }
  return null;
};

export function NavigationControls({ 
  unitId, 
  section 
}: { 
  unitId: string;
  section: 'video' | 'questions';
}) {
  const router = useRouter();

  const handlePrevious = () => {
    if (section === 'questions') {
      // Go back to video section
      router.push(`/course/${unitId}/video`);
    } else {
      // Go to previous unit's questions
      const prevUnitId = getPreviousUnitId(unitId);
      if (prevUnitId) {
        router.push(`/course/${prevUnitId}/questions`);
      }
    }
  };

  const handleNext = () => {
    if (section === 'video') {
      // Go to questions section
      router.push(`/course/${unitId}/questions`);
    } else {
      // Go to next unit's video
      const nextUnitId = getNextUnitId(unitId);
      if (nextUnitId) {
        router.push(`/course/${nextUnitId}/video`);
      }
    }
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePrevious}
        className="px-6 py-3 bg-secondary rounded-lg"
      >
        Previous
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNext}
        className="px-6 py-3 bg-secondary rounded-lg"
      >
        Next
      </motion.button>
    </div>
  );
} 