"use client";

import ScrollNavigator from "./components/ScrollNavigator";
import ProgressBar from "./components/ProgressBar";
import { useRouter, usePathname, useParams } from "next/navigation";
import courseData from "@/app/_components/(semester1)/courseData";
import { useEffect, useState } from "react";

export default function LearnLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { semesterId, chapterId, unitId } = useParams();
  const [currentSection, setCurrentSection] = useState<'video' | 'quiz'>('video');

  // Parse the current path to get semester, chapter, and unit IDs
  const pathParts = pathname.split('/');
  const section = pathParts[5];

  // Find current unit and its position
  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === chapterId);
  const currentUnit = chapter?.units.find(u => u.id === unitId);
  
  // Find unit indices
  const currentChapterIndex = semester?.chapters.findIndex(ch => ch.id === chapterId) || 0;
  const currentUnitIndex = chapter?.units.findIndex(u => u.id === unitId) || 0;

  // Find previous and next units
  const prevUnit = currentUnitIndex > 0 
    ? chapter?.units[currentUnitIndex - 1]
    : currentChapterIndex > 0 
      ? semester?.chapters[currentChapterIndex - 1].units.slice(-1)[0]
      : null;

  const nextUnit = currentUnitIndex < (chapter?.units.length || 0) - 1
    ? chapter?.units[currentUnitIndex + 1]
    : currentChapterIndex < (semester?.chapters.length || 0) - 1
      ? semester?.chapters[currentChapterIndex + 1].units[0]
      : null;

  // Update current section based on path
  useEffect(() => {
    if (section === 'video' || section === 'quiz') {
      setCurrentSection(section);
    }
  }, [section]);

  // Improved unit type detection
  const determineUnitType = (unit) => {
    // First check for question/quiz content
    if (unit.questions && unit.questions.length > 0) {
      return 'quiz';
    }
    
    // If the unit has a quiz property that's non-empty
    if (unit.quiz && (typeof unit.quiz === 'object' || unit.quiz === true)) {
      return 'quiz';
    }
    
    // If the unit has a video property with content
    if (unit.video) {
      // Handle the case where video might contain questions too
      if (unit.video.questions && unit.video.questions.length > 0) {
        // This unit has both video and questions - need to check current path
        // to determine if we're in the video or quiz part
        const currentPath = window.location.pathname;
        if (currentPath.includes('/quiz')) {
          return 'quiz';
        } else {
          return 'video';
        }
      }
      return 'video';
    }
    
    // Fallback to an explicit type property if it exists
    if (unit.type) {
      return unit.type.toLowerCase();
    }
    
    // Default fallback
    console.warn('Could not determine unit type, defaulting to video', unit);
    return 'video';
  };
  
  const handleNavigation = (direction: 'next' | 'prev') => {
    // Find current position in course structure
    const semester = courseData.find(sem => sem.id === semesterId);
    if (!semester) return;
    
    const chapterIndex = semester.chapters.findIndex(ch => ch.id === chapterId);
    if (chapterIndex === -1) return;
    
    const currentChapter = semester.chapters[chapterIndex];
    const unitIndex = currentChapter.units.findIndex(u => u.id === unitId);
    if (unitIndex === -1) return;
    
    const currentUnit = currentChapter.units[unitIndex];
    const currentPath = window.location.pathname;
    const isInVideoSection = currentPath.includes('/video');
    const isInQuizSection = currentPath.includes('/quiz');
    
    // First, handle navigation within the same unit
    if (direction === 'next' && isInVideoSection) {
      // If we're in video section and going next, check if this unit has questions
      if (currentUnit.video?.questions?.length > 0) {
        // Navigate to quiz section of the same unit
        return router.push(`/course/${semesterId}/${chapterId}/${unitId}/quiz`);
      }
    } else if (direction === 'prev' && isInQuizSection) {
      // If we're in quiz section and going back, go to video section of the same unit
      return router.push(`/course/${semesterId}/${chapterId}/${unitId}/video`);
    }
    
    // If we're navigating between units
    let targetChapter, targetUnit;
    
    if (direction === 'next') {
      // If we're in quiz section, move to next unit's video
      if (isInQuizSection) {
        if (unitIndex === currentChapter.units.length - 1) {
          // Last unit in chapter, move to first unit of next chapter
          if (chapterIndex < semester.chapters.length - 1) {
            targetChapter = semester.chapters[chapterIndex + 1];
            targetUnit = targetChapter.units[0];
          }
        } else {
          // Move to next unit in same chapter
          targetChapter = currentChapter;
          targetUnit = currentChapter.units[unitIndex + 1];
        }
      }
    } else if (direction === 'prev') {
      // If we're in video section, move to previous unit's quiz
      if (isInVideoSection) {
        if (unitIndex === 0) {
          // First unit in chapter, move to last unit of previous chapter
          if (chapterIndex > 0) {
            targetChapter = semester.chapters[chapterIndex - 1];
            targetUnit = targetChapter.units[targetChapter.units.length - 1];
          }
        } else {
          // Move to previous unit in same chapter
          targetChapter = currentChapter;
          targetUnit = currentChapter.units[unitIndex - 1];
        }
      }
    }
    
    // Only navigate if we found a valid target
    if (targetChapter && targetUnit) {
      // When moving to a new unit:
      // - If going forward from quiz, go to next unit's video
      // - If going backward from video, go to previous unit's quiz
      const targetSection = (direction === 'next' && isInQuizSection) ? 'video' : 'quiz';
      router.push(`/course/${semesterId}/${targetChapter.id}/${targetUnit.id}/${targetSection}`);
    }
  };
  
  // Connect to your existing scroll or button handlers
  const handleScrollUp = () => handleNavigation('prev');
  const handleScrollDown = () => handleNavigation('next');
  
  // Update your handleIndicatorPosition function
  const handleIndicatorPosition = (position) => {
    // Existing threshold code...
    
    if (position > upperThreshold) {
      handleNavigation('next');
    } else if (position < lowerThreshold) {
      handleNavigation('prev');
    }
  };

  return (
    <div className="relative min-h-screen">
      {children}
      <ScrollNavigator
        onUpClick={handleScrollUp}
        onDownClick={handleScrollDown}
        currentSection={currentSection}
      />
      <ProgressBar
        currentChapterId={chapterId as string}
        currentUnitId={unitId as string}
        currentSection={currentSection}
      />
    </div>
  );
}


