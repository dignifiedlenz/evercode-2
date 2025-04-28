"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import CustomLink from "./CustomLink";
import InstructorLightbox from "./InstructorLightbox";
import courseData from "./(semester1)/courseData";
import Sidebar from "./sidebar";
import { CompletedUnits, Unit, Semester, Chapter } from "@/types/course";
import { useRouter } from "next/navigation";
import { UserProgress } from "@/lib/progress-service";
import { useAuth } from "@/context/AuthContext";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import CircularProgress from './CircularProgress';

interface DashboardContentProps {
  firstName: string;
  currentSemester: number;
  semesters: Semester[];
}

// Custom event names
const PROGRESS_UPDATED_EVENT = 'progress-updated';

// Define an interface for the navigation links
interface NavLink {
  text: string;
  href: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function DashboardContent({ 
  firstName, 
  currentSemester,
  semesters
}: DashboardContentProps) {
  const { user } = useAuth();
  const [selectedInstructor, setSelectedInstructor] = useState<number | null>(null);
  const router = useRouter();
  const [nextIncompleteUnit, setNextIncompleteUnit] = useState<{
    semesterId: string;
    chapterId: string;
    unitId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progressVersion, setProgressVersion] = useState(0);
  const [nextUnitInfo, setNextUnitInfo] = useState<{
    chapterTitle: string;
    unitTitle: string;
  } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progressData, setProgressData] = useState<UserProgress | null>(null);
  const [isContentVisible, setIsContentVisible] = useState(false);

  // Combine loading states
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [completedUnitMap, setCompletedUnitMap] = useState<Record<string, boolean>>({});
  const [calculatedProgress, setCalculatedProgress] = useState(0);
  const [videosCompleted, setVideosCompleted] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Add motion values for animations
  const semesterProgress = useMotionValue(0);
  const videosProgress = useMotionValue(0);
  const questionsProgress = useMotionValue(0);
  const roundedSemesterProgress = useTransform(semesterProgress, value => `${Math.round(value)}%`);
  const roundedVideosProgress = useTransform(videosProgress, value => Math.round(value));
  const roundedQuestionsProgress = useTransform(questionsProgress, value => Math.round(value));

  // Get semester data with proper ID format
  const semester = useMemo(() => {
    return semesters.find(sem => sem.id === `semester-${currentSemester}`);
  }, [semesters, currentSemester]);

  const instructors = semester?.instructors || [];
  const semesterTitle = semester?.title?.split(': ')[1] || 'Home';

  // Get the background image path
  const backgroundImagePath = useMemo(() => {
    if (!semester?.backgroundImage) return '/540598ldsdl.jpg';
    return semester.backgroundImage.startsWith('/') 
      ? semester.backgroundImage 
      : `/${semester.backgroundImage}`;
  }, [semester]);

  // Get the ordered list of all units
  const orderedUnits = useMemo(() => {
    const units: { chapterId: string; unit: Unit }[] = [];
    courseData.forEach((semester: Semester) => {
      semester.chapters.forEach((chapter: Chapter) => {
        chapter.units.forEach((unit: Unit) => {
          units.push({ chapterId: chapter.id, unit });
        });
      });
    });
    return units;
  }, []);

  // Calculate total videos and questions for the semester
  useEffect(() => {
    if (!semester) return;

    let totalVids = 0;
    let totalQs = 0;

    semester.chapters.forEach(chapter => {
      chapter.units.forEach(unit => {
        if (unit.video) {
          totalVids++;
          totalQs += unit.video.questions.length;
        }
      });
    });

    setTotalVideos(totalVids);
    setTotalQuestions(totalQs);
  }, [semester]);

  // Update progress metrics when completed units change
  useEffect(() => {
    if (!semester || !completedUnitMap) return;

    let completedVids = 0;
    let completedQs = 0;

    semester.chapters.forEach(chapter => {
      chapter.units.forEach(unit => {
        if (completedUnitMap[unit.id]) {
          if (unit.video) {
            completedVids++;
            completedQs += unit.video.questions.length;
          }
        }
      });
    });

    setVideosCompleted(completedVids);
    setQuestionsAnswered(completedQs);
  }, [semester, completedUnitMap]);

  // Update the next unit info with titles
  const updateNextUnitInfo = useCallback((unitData: { semesterId: string; chapterId: string; unitId: string }) => {
    for (const semester of courseData) {
      if (semester.id === unitData.semesterId) {
        for (const chapter of semester.chapters) {
          if (chapter.id === unitData.chapterId) {
            for (const unit of chapter.units) {
              if (unit.id === unitData.unitId) {
                setNextUnitInfo({
                  chapterTitle: chapter.title,
                  unitTitle: unit.title
                });
                return;
              }
            }
          }
        }
      }
    }
    setNextUnitInfo(null);
  }, []);

  // Fetch progress data with optimized loading
  useEffect(() => {
    let isMounted = true;

    const fetchProgress = async () => {
      if (!user) {
        if (isMounted) {
          setIsLoadingProgress(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch('/api/progress');
        if (!response.ok) throw new Error(`Failed to fetch progress: ${response.statusText}`);
        const data: { completedUnitIds: string[] } = await response.json();
        
        if (!isMounted) return;

        // Convert array to map for easier lookup
        const unitMap: Record<string, boolean> = {};
        data.completedUnitIds.forEach(id => { unitMap[id] = true; });
        setCompletedUnitMap(unitMap);

        // Calculate progress percentage
        const totalUnits = semesters.reduce((count, sem) => 
          count + sem.chapters.reduce((chapCount, chap) => chapCount + chap.units.length, 0), 0);
        const completedCount = data.completedUnitIds.length;
        const progressPercentage = totalUnits > 0 ? (completedCount / totalUnits) * 100 : 0;
        setCalculatedProgress(progressPercentage);

      } catch (error) {
        console.error("Error fetching progress:", error);
        if (isMounted) {
          setCompletedUnitMap({});
          setCalculatedProgress(0);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProgress(false);
          setIsLoading(false);
        }
      }
    };

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [user, semesters]);

  // Find the next incomplete unit WITHIN THE CURRENT SEMESTER
  const findNextIncompleteUnit = useCallback(() => {
    if (!semester || isLoadingProgress) return null;

    for (const chapter of semester.chapters) {
      for (const unit of chapter.units) {
        if (!completedUnitMap[unit.id]) {
          return {
            semesterId: semester.id,
            chapterId: chapter.id,
            unitId: unit.id
          };
        }
      }
    }
    return null;
  }, [semester, completedUnitMap, isLoadingProgress]);

  // Effect to find the next unit when progress loads or changes
  useEffect(() => {
    if (!isLoadingProgress) {
      const nextUnit = findNextIncompleteUnit();
      setNextIncompleteUnit(nextUnit);
      if (nextUnit) {
        updateNextUnitInfo(nextUnit);
      } else {
        setNextUnitInfo(null);
      }
    }
  }, [isLoadingProgress, findNextIncompleteUnit, updateNextUnitInfo]);

  // THIS is the function we want to use for both buttons
  const navigateToNextUnit = useCallback(() => {
    if (!nextIncompleteUnit || isLoading || isNavigating) return;
    setIsNavigating(true);
    console.log("Navigating to next unit:", nextIncompleteUnit);
    const { semesterId, chapterId, unitId } = nextIncompleteUnit;

    // Look up the unit in courseData
    let foundUnit = null;
    for (const sem of courseData) {
      if (sem.id === semesterId) {
        for (const chap of sem.chapters) {
          if (chap.id === chapterId) {
            foundUnit = chap.units.find(u => u.id === unitId);
            break;
          }
        }
      }
    }

    // Determine if the unit has a video and/or quiz
    const hasVideo = !!foundUnit?.video;
    const hasQuiz = !!foundUnit?.video?.questions && foundUnit.video.questions.length > 0;

    // Find progress for this unit
    const unitProgress = progressData?.unitProgress?.find(
      up => up.unitId === unitId && up.chapterId === chapterId
    );
    const videoProgress = progressData?.videoProgress?.find(
      vp => vp.unitId === unitId && vp.chapterId === chapterId
    );
    const videoCompleted = unitProgress?.videoCompleted === true || videoProgress?.completed === true;

    // If video is completed and there is a quiz, go to quiz. Otherwise, go to video.
    let section: 'video' | 'quiz' = 'video';
    if (videoCompleted && hasQuiz) {
      section = 'quiz';
    } else {
      section = 'video';
    }

    router.push(`/course/${semesterId}/${chapterId}/${unitId}/${section}`);
    setTimeout(() => setIsNavigating(false), 3000);
  }, [nextIncompleteUnit, isLoading, isNavigating, router, progressData]);

  // Effect to handle content visibility
  useEffect(() => {
    if (!isLoading && !isLoadingProgress) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsContentVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isLoadingProgress]);

  // Animate progress values when they change
  useEffect(() => {
    const animation = animate(semesterProgress, calculatedProgress, {
      duration: 1.5,
      ease: "easeOut"
    });
    return animation.stop;
  }, [calculatedProgress, semesterProgress]);

  useEffect(() => {
    const animation = animate(videosProgress, videosCompleted, {
      duration: 1.5,
      ease: "easeOut"
    });
    return animation.stop;
  }, [videosCompleted, videosProgress]);

  useEffect(() => {
    const animation = animate(questionsProgress, questionsAnswered, {
      duration: 1.5,
      ease: "easeOut"
    });
    return animation.stop;
  }, [questionsAnswered, questionsProgress]);

  return (
    <div className="relative h-screen w-screen px-4 py-4 md:px-8 md:py-8 xl:px-16 xl:py-8 overflow-hidden">
      {/* Loading Overlay */}
      {!isContentVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 animate-pulse px-8 h-screen">
            {/* Left Skeleton */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-start h-full space-y-8">
              <div className="h-16 w-3/4 bg-zinc-700/60 rounded mb-4" />
              <div className="h-12 w-1/2 bg-zinc-700/60 rounded mb-4" />
              <div className="space-y-3 w-full max-w-xs">
                <div className="h-6 w-3/4 bg-zinc-700/60 rounded" />
                <div className="h-6 w-2/3 bg-zinc-700/60 rounded" />
                <div className="h-6 w-5/6 bg-zinc-700/60 rounded" />
                <div className="h-6 w-1/2 bg-zinc-700/60 rounded" />
              </div>
            </div>
            {/* Right Skeleton */}
            <div className="w-full lg:w-1/2 flex flex-col items-end justify-center h-full gap-8">
              <div className="bg-zinc-700/60 rounded-2xl w-[500px] h-[320px] mb-8" />
              <div className="bg-zinc-700/60 rounded-2xl w-[500px] h-[120px]" />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 transition-opacity duration-500 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="sm:pt-0 flex flex-col h-screen w-full text-white overflow-hidden">
          <div className="h-screen min-w-screen">
            <h2 className="fixed left-1/2 hidden sm:block top-5 -translate-x-1/2 text-center text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 font-morion tracking-wider">{semesterTitle}</h2>
            
            {/* Updated overlay with gradient and better opacity */}
            <div className="h-full flex flex-col lg:flex-row"> 
              {/* Main Content */}
              <div className="flex flex-col lg:flex-row w-full">
                {/* Left Content Section */}
                <div className="w-full lg:w-2/3 flex flex-col justify-center items-start h-full px-12 lg:pl-24 py-8 space-y-8">
                  <h1 className="text-5xl pt-4 sm:pt-0 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-neima">
                    Welcome Back {user?.firstName || 'User'}!
                  </h1>
                  {/* Main Resume Course Button */}
                  <div className="font-morion w-full max-w-xs">
                    <button
                      onClick={navigateToNextUnit}
                      disabled={!nextIncompleteUnit || isLoading || isNavigating}
                      className={`w-full px-6 py-3 rounded transition-all duration-300 font-medium text-sm md:text-base 
                        ${!nextIncompleteUnit || isLoading || isNavigating 
                          ? 'bg-zinc-700 cursor-not-allowed text-zinc-400' 
                          : 'bg-secondary hover:bg-opacity-80 text-black'}`}
                    >
                      {isLoading 
                        ? 'Loading...' 
                        : isNavigating 
                          ? 'Navigating...' 
                          : nextIncompleteUnit 
                            ? 'Resume Course' 
                            : 'All Units Completed'}
                      {nextUnitInfo && !isLoading && !isNavigating && (
                        <span className="block text-xs mt-1 opacity-80">
                          {`${nextUnitInfo.chapterTitle}: ${nextUnitInfo.unitTitle}`}
                        </span>
                      )}
                    </button>
                  </div>
                  {/* Aside Links */}
                  <aside className="pt-8 w-full max-w-xs">
                    <nav className="space-y-3 font-morion text-base">
                      {([
                        { text: 'My Achievements', href: `/course/semester-${currentSemester}/achievements` },
                        { text: 'Contact Support', href: `/course/semester-${currentSemester}/support` },
                        { text: 'Meet Your Instructors', href: `/course/semester-${currentSemester}/instructors` },
                        { text: 'View Notes', href: `/course/semester-${currentSemester}/notes` }
                      ] as NavLink[]).map((link, index) => (
                        <div key={index}>
                          <CustomLink href={link.href} className="text-white/80 hover:text-white transition-colors">
                            {link.text}
                          </CustomLink>
                        </div>
                      ))}
                    </nav>
                  </aside>
                </div>

                {/* Right Sidebar Section - Responsive */}
                <div className="w-full lg:w-1/3 flex flex-col items-end justify-center h-full px-2 sm:px-4 lg:pr-8 py-8 space-y-8">
                  {/* Progress Stats Window - Responsive */}
                  <div className="bg-black/20 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:w-[400px] shadow-xl flex flex-col justify-center mx-auto">
                    <div className="space-y-8">
                      <div>
                        <p className="text-base text-zinc-400 font-morion mb-2">Semester Progress</p>
                        <motion.p className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-neima text-secondary">
                          {roundedSemesterProgress}
                        </motion.p>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8">
                        <CircularProgress
                          value={videosCompleted}
                          max={totalVideos}
                          label="Videos"
                          color="secondary"
                        />
                        <CircularProgress
                          value={questionsAnswered}
                          max={totalQuestions}
                          label="Questions"
                          color="secondary"
                        />
                      </div>
                      <div className="my-4 border-t border-white/20" />
                      <div>
                        <p className="font-morion text-sm md:text-lg mb-4">Your Instructors for this semester</p>
                        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                          {instructors.map((instructor, index) => (
                            <button 
                              key={instructor.id} 
                              className="relative group focus:outline-none"
                              onClick={() => setSelectedInstructor(index + 1)}
                            >
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-secondary/30 group-hover:border-secondary transition-colors duration-300">
                                <img 
                                  src={instructor.profileImage} 
                                  alt={instructor.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-base text-white/80 whitespace-nowrap">{instructor.name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor Lightbox */}
          <InstructorLightbox
            isOpen={!!selectedInstructor}
            onClose={() => setSelectedInstructor(null)}
            instructorId={selectedInstructor || 0}
            semesterId={currentSemester}
          />
        </div>
      </div>
    </div>
  );
} 