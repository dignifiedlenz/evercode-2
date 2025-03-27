'use client';

import { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import courseData from '@/app/_components/(semester1)/courseData';

interface LayoutProps {
  children: ReactNode;
}

export default function UnitLayout({ children }: LayoutProps) {
  const { semesterId, chapterId } = useParams();
  
  // Find the chapter to get its background image
  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === chapterId);
  const backgroundImage = chapter?.backgroundImage;
  
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      {backgroundImage && (
        <div className="fixed inset-0 z-10">
          <Image
            src={backgroundImage}
            alt="Chapter Background"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
      )}
      
      {/* Fallback background color for when image is not available */}
      <div className="fixed inset-0 -z-20 bg-[#0A0A0A]" />
      
      {/* Content */}
      {children}
    </div>
  );
} 