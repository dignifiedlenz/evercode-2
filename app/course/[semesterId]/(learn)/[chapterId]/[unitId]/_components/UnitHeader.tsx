"use client";

import courseData from "@/app/_components/(semester1)/courseData";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export default function UnitHeader() {
  const { semesterId, chapterId, unitId } = useParams();
  
  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === chapterId);
  const unit = chapter?.units.find(u => u.id === unitId);

  const prevTitlesRef = useRef({ chapterTitle: '', unitTitle: '' });
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (chapter && unit) {
      const titlesChanged = 
        chapter.title !== prevTitlesRef.current.chapterTitle || 
        unit.title !== prevTitlesRef.current.unitTitle;
      
      if (titlesChanged) {
        setShouldAnimate(true);
        prevTitlesRef.current = {
          chapterTitle: chapter.title,
          unitTitle: unit.title
        };
      } else {
        setShouldAnimate(false);
      }
    }
  }, [chapter, unit]);

  if (!chapter || !unit) return null;

  return (
    <motion.div 
      initial={shouldAnimate ? { opacity: 0 } : undefined}
      animate={{ opacity: 1 }}
      exit={shouldAnimate ? { opacity: 0 } : undefined}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ viewTransitionName: `unit-header-${unitId}` }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col space-y-1 items-center">
          <h1 className="text-sm text-white/60 font-morion-light">
            {chapter.title}
          </h1>
          <h2 className="text-xl text-white font-morion-medium">
            {unit.title}
          </h2>
        </div>
      </div>
    </motion.div>
  );
} 