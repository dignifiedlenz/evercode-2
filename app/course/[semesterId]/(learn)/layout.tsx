"use client";

import ScrollNavigator from "./components/ScrollNavigator";
import { useRouter, usePathname } from "next/navigation";
import courseData from "@/app/_components/(semester1)/courseData";
import { useEffect, useState } from "react";

export default function LearnLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentSection, setCurrentSection] = useState<'video' | 'quiz'>('video');

  // Parse the current path to get semester, chapter, and unit IDs
  const pathParts = pathname.split('/');
  const semesterId = pathParts[2];
  const chapterId = pathParts[3];
  const unitId = pathParts[4];
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

  const handleUpClick = () => {
    if (currentSection === 'quiz') {
      // If in quiz, go to video of same unit
      router.push(`/course/${semesterId}/${chapterId}/${unitId}/video`);
    } else if (prevUnit) {
      // If in video, go to quiz of previous unit
      router.push(`/course/${semesterId}/${chapterId}/${prevUnit.id}/quiz`);
    }
  };

  const handleDownClick = () => {
    if (currentSection === 'video') {
      // If in video, go to quiz of same unit
      router.push(`/course/${semesterId}/${chapterId}/${unitId}/quiz`);
    } else if (nextUnit) {
      // If in quiz, go to video of next unit
      router.push(`/course/${semesterId}/${chapterId}/${nextUnit.id}/video`);
    }
  };

  return (
    <div className="relative min-h-screen">
      {children}
      <ScrollNavigator
        onUpClick={handleUpClick}
        onDownClick={handleDownClick}
        currentSection={currentSection}
      />
    </div>
  );
}


