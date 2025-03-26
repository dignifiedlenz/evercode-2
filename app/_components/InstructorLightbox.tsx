"use client";

import { useState, useEffect } from 'react';
import courseData from './(semester1)/courseData';
import dynamic from 'next/dynamic';

// Dynamically import ReactPlayer with no SSR to prevent hydration issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface InstructorLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  instructorId: number;
  semesterId: number;
}

export default function InstructorLightbox({ isOpen, onClose, instructorId, semesterId }: InstructorLightboxProps) {
  const [playing, setPlaying] = useState(false);
  const [muted] = useState(true);
  const [volume] = useState(0.5);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentSemesterId, setCurrentSemesterId] = useState<number>(semesterId);
  
  // Safely update semester ID when prop changes
  useEffect(() => {
    setCurrentSemesterId(semesterId);
  }, [semesterId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const semester = courseData.find(sem => sem.id === `semester-${currentSemesterId}`);
  const instructor = semester?.instructors[instructorId - 1];

  if (!instructor) {
    console.error('Instructor not found:', { semesterId: currentSemesterId, instructorId });
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-3xl mx-4 bg-zinc-900 rounded-lg overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/60 hover:text-white z-10 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Player */}
        <div className="w-full aspect-video bg-black">
          <ReactPlayer
            url={instructor?.introductionVideo || ''}
            controls
            width="100%"
            height="100%"
            playing={false}
            onReady={() => setPlayerReady(true)}
            onError={(error) => console.error("Video player error:", error)}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  onContextMenu: (e: React.MouseEvent) => e.preventDefault()
                }
              }
            }}
          />
        </div>

        {/* Instructor Info */}
        <div className="p-4 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex flex-col gap-3">
            {/* Instructor Details */}
            <div className="w-full">
              <h3 className="text-xl font-custom1 text-white mb-1">{instructor.name}</h3>
              <p className="text-secondary font-morion mb-2">{instructor.role}</p>
              <p className="text-white/80 leading-relaxed text-sm">{instructor.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 