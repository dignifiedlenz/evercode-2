"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from "./_media/logo";
import SemesterSelector from "./SemesterSelector";
import Sidebar from "./sidebar";
import courseData from "./(semester1)/courseData";
import { CompletedUnits } from "@/types/course";

interface LogoSectionProps {
  completedUnits: CompletedUnits;
}

export default function LogoSection({ completedUnits }: LogoSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSemester = searchParams.get('semester') ? parseInt(searchParams.get('semester')!) : 1;

  const handleSemesterChange = (semester: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('semester', semester.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <Link href="/course" className="fixed left-5 top-3 opacity-65 hover:opacity-100 z-50">
        <Logo />
      </Link>

      <div className="fixed left-20 top-3 flex flex-col items-start font-morion opacity-100 z-50">
        <img src="/EvermodeTypeLogo.svg" alt="arrow-right" className="w-40 h-10" />
        <SemesterSelector 
          currentSemester={currentSemester} 
          onSemesterChange={handleSemesterChange} 
        />
      </div>

      <div className="fixed z-40 bg-gradient-to-r from-black/80 to-transparent">
        <Sidebar 
          courseData={courseData} 
          currentSemester={currentSemester} 
          completedUnits={completedUnits} 
        />
      </div>
    </>
  );
} 