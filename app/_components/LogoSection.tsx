"use client";

import { useRouter } from 'next/navigation';
import { useTransitionRouter } from 'next-view-transitions';
import { Logo } from "./_media/logo";
import SemesterSelector from "./SemesterSelector";

interface LogoSectionProps {
  semesterId: string;
}

export default function LogoSection({ semesterId }: LogoSectionProps) {
  const legacyRouter = useRouter();
  const transitionRouter = useTransitionRouter();

  // Add debug logging
  console.log('[LogoSection] Rendering with semesterId:', semesterId);

  const currentSemester = semesterId 
    ? parseInt(semesterId.replace('semester-', ''), 10) 
    : 1;

  const dashboardHref = `/course/semester-${currentSemester}`;

  const handleSemesterChange = (semester: number) => {
    console.log('[LogoSection] Changing semester to:', semester);
    legacyRouter.push(`/course/semester-${semester}`);
  };

  const handleLogoClick = () => {
    console.log('[LogoSection] Logo clicked, navigating to:', dashboardHref);
    transitionRouter.push(dashboardHref);
  };

  return (
    <>
      <button 
        onClick={handleLogoClick}
        className="fixed left-2 sm:left-5 top-2 sm:top-3 opacity-65 hover:opacity-100 z-50 focus:outline-none"
        aria-label={`Go to Semester ${currentSemester} Dashboard`}
      >
        <Logo />
      </button>

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