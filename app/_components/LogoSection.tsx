"use client";

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Logo } from "./_media/logo";
import SemesterSelector from "./SemesterSelector";
import { CompletedUnits } from "@/types/course";

interface LogoSectionProps {
  completedUnits: CompletedUnits;
}

export default function LogoSection({ completedUnits }: LogoSectionProps) {
  const router = useRouter();
  const params = useParams();
  const semesterId = typeof params.semesterId === 'string' ? params.semesterId : '';
  const currentSemester = semesterId 
    ? parseInt(semesterId.replace('semester-', ''), 10) 
    : 1;

  const handleSemesterChange = (semester: number) => {
    router.push(`/course/semester-${semester}`);
  };

  return (
    <>
      <Link href="/course" className="fixed left-2 sm:left-5 top-2 sm:top-3 opacity-65 hover:opacity-100 z-50">
        <Logo />
      </Link>

      <div className="fixed left-12 sm:left-20 top-2 sm:top-3 flex flex-col items-start font-morion opacity-100 z-50">
        <div className="h-[5vh] sm:h-auto">
          <img 
            src="/EvermodeTypeLogo.svg" 
            alt="Evermode" 
            className="h-full w-auto sm:w-40 sm:h-10"
          />
        </div>
        <SemesterSelector 
          currentSemester={currentSemester} 
          onSemesterChange={handleSemesterChange} 
        />
      </div>

    </>
  );
} 