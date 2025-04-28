"use client";

import { useMemo } from "react";
import { use } from "react";
import courseData from "@/app/_components/(semester1)/courseData";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ semesterId: string }>;
}

export default function SemesterLayout({ children, params }: LayoutProps) {
  const resolvedParams = use(params);
  const semesterId = parseInt(resolvedParams.semesterId.split('-')[1]);
  
  const semester = useMemo(() => 
    courseData.find(sem => sem.id === `semester-${semesterId}`)
  , [semesterId]);
  
  const backgroundImage = semester?.backgroundImage || '/540598ldsdl.jpg';

  return (
    <div className="relative min-h-screen w-screen bg-black/75">
      {/* Background Image */}
      <div 
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
      />

      {/* Radial Vignette Overlay */}
      <div 
        className="fixed inset-0 w-full h-full"
        style={{
          background: `radial-gradient(circle at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.95) 100%)`,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 