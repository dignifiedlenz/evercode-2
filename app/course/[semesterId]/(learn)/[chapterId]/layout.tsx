"use client";

import { useParams } from "next/navigation";
import { useChronologicalMode } from "@/app/context/ChronologicalModeContext";
import courseData from "@/app/_components/(semester1)/courseData";
import Image from "next/image";
import { ViewTransitions } from 'next-view-transitions';

// Static elements that won't be part of the transition
const StaticElements = ({ backgroundImage }: { backgroundImage?: string }) => (
  <>
    {/* Background Image */}
    {backgroundImage && (
      <div className="fixed inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Chapter Background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/75" />
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />
      </div>
    )}

    {/* Chronological Mode Switch */}
    <div className="fixed top-4 right-[6.25rem] z-40">
      <ChronologicalModeButton />
    </div>
  </>
);

// Separate component for the mode button to avoid unnecessary re-renders
const ChronologicalModeButton = () => {
  const { isChronologicalMode, toggleChronologicalMode } = useChronologicalMode();
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span className="text-white/80 text-sm">Chronological Mode</span>
      <input
        type="checkbox"
        checked={isChronologicalMode}
        onChange={toggleChronologicalMode}
        className="sr-only"
      />
      <span
        className={`w-10 h-6 flex items-center bg-white/20 rounded-full p-1 transition-colors duration-300 ${isChronologicalMode ? 'bg-secondary/60' : 'bg-white/20'}`}
      >
        <span
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isChronologicalMode ? 'translate-x-4 bg-secondary' : ''}`}
        />
      </span>
    </label>
  );
};

export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { semesterId, chapterId } = useParams();

  // Get the current chapter's background image
  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === chapterId);
  const backgroundImage = chapter?.backgroundImage;

  return (
    <div className="relative min-h-screen">
      {/* Static elements that stay mounted */}
      <StaticElements backgroundImage={backgroundImage} />

      {/* Content with View Transitions - Only this part will animate */}
      <div className="relative z-10">
        <ViewTransitions>
          <div style={{ viewTransitionName: 'content' }}>
            {children}
          </div>
        </ViewTransitions>
      </div>
    </div>
  );
} 