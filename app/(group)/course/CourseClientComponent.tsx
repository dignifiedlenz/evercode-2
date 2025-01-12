// src/app/course/CourseClientComponent.tsx

'use client';

import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import courseData from '@/app/_components/(semester1)/courseData';
import { useProgress } from '@/context/ProgressContext';
import Notes from './_components/Noteopener';
import { Semester, Chapter, Unit } from '@/types/course';

interface FoundUnit {
  semester: Semester;
  chapter: Chapter;
  unit: Unit;
}

const CourseClientComponent: React.FC = () => {
  const { status } = useSession(); // Removed 'session'
  const router = useRouter();
  const searchParams = useSearchParams();

  const { markUnitAsCompleted } = useProgress(); // Removed 'completedUnits'

  const [foundUnit, setFoundUnit] = useState<FoundUnit | null>(null);

  const [isQuestionSection, setIsQuestionSection] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasWrongAnswer, setHasWrongAnswer] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Read the 'session' query parameter
  const sessionParam = searchParams.get("session");

  // Redirect unauthenticated users to sign-in page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Debugging: Log the current session parameter
  useEffect(() => {
    console.log("Current Session Parameter:", sessionParam);
  }, [sessionParam]);

  // Fetch and set the current unit based on sessionParam
  useEffect(() => {
    console.log("Fetching unit for session:", sessionParam);

    const sessionId = sessionParam;

    if (!sessionId) {
      // If no session is specified, navigate to the first unit
      const firstUnit = courseData[0]?.chapters[0]?.units[0];
      if (firstUnit) {
        console.log("Redirecting to first unit:", firstUnit.id);
        router.push(`/course?session=${firstUnit.id}`);
      } else {
        // Handle case where courseData is empty
        console.error("No units available in courseData.");
      }
      return;
    }

    // Find the unit in courseData
    let found: FoundUnit | null = null;

    for (const semester of courseData) {
      for (const chapter of semester.chapters) {
        for (const unit of chapter.units) {
          if (unit.id === sessionId) {
            found = { semester, chapter, unit };
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }

    if (found) {
      console.log("Found Unit:", found);
      setFoundUnit(found);
    } else {
      // If unit not found, redirect to first unit
      console.error(`Unit with id ${sessionId} not found.`);
      const firstUnit = courseData[0]?.chapters[0]?.units[0];
      if (firstUnit) {
        router.push(`/course?session=${firstUnit.id}`);
      } else {
        console.error("No units available in courseData.");
      }
    }
  }, [sessionParam, router]);

  // Handle cooldown timer for incorrect answers
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLocked && cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => prev - 1);
      }, 1000);
    }
    if (isLocked && cooldownTime === 0) {
      setIsLocked(false);
    }
    return () => clearInterval(timer);
  }, [isLocked, cooldownTime]);

  // Debugging: Log the received foundUnit
  useEffect(() => {
    if (foundUnit) {
      console.log("CourseClientComponent received foundUnit:", foundUnit);
    }
  }, [foundUnit]);

  // Handle video end
  const handleVideoEnd = () => {
    setIsQuestionSection(true);
    console.log("Video ended for unit:", foundUnit?.unit.id);
  };

  // Handle correct answer
  const handleCorrectAnswer = () => {
    if (!foundUnit) return;

    console.log("Correct answer selected.");
    if (currentQuestionIndex < foundUnit.unit.video.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Mark unit as completed
      markUnitAsCompleted(foundUnit.chapter.id, foundUnit.unit.id);
      setIsQuestionSection(false);
      setCurrentQuestionIndex(0);

      // Navigate to next unit if available
      const nextUnit = getNextUnit(foundUnit.unit.id);
      if (nextUnit) {
        console.log("Navigating to next unit:", nextUnit.id);
        router.push(`/course?session=${nextUnit.id}`);
      } else {
        // Course completed
        alert("🎉 Congratulations! You have completed the entire course.");
        // Optionally, redirect or reset
      }
    }
  };

  // Handle incorrect answer
  const handleIncorrectAnswer = () => {
    console.log("Incorrect answer selected.");
    setHasWrongAnswer(true);
    setIsLocked(true);
    setCooldownTime(20);
  };

  // Handle answer selection
  const handleAnswerSelection = (selected: string) => {
    if (isLocked) {
      console.log("Answer selection locked.");
      return;
    }
    if (selected === currentQuestion.correctAnswer) {
      setHasWrongAnswer(false);
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
  };

  // Function to get the next unit in order
  const getNextUnit = (currentUnitId: string): Unit | null => {
    const allUnits: { chapterId: string; unit: Unit }[] = [];
    courseData.forEach((sem) => {
      sem.chapters.forEach((chap) => {
        chap.units.forEach((uni) => {
          allUnits.push({ chapterId: chap.id, unit: uni });
        });
      });
    });

    const currentIndex = allUnits.findIndex((u) => u.unit.id === currentUnitId);
    if (currentIndex >= 0 && currentIndex < allUnits.length - 1) {
      return allUnits[currentIndex + 1].unit;
    }
    return null;
  };

  if (status === "loading" || !foundUnit) {
    return <p className="text-white">Loading...</p>;
  }

  const currentVideo = foundUnit.unit.video;
  const currentQuestion = currentVideo.questions[currentQuestionIndex];

  // Animation Variants
  const verticalSlide = {
    initial: { y: '100%', opacity: 0 },
    animate: { y: '0%', opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  };

  const horizontalSlide = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: '0%', opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  };

  return (
    <div className="relative flex flex-row w-screen h-screen bg-black text-white">
      {/* Sidebar for Notes */}
      <Notes />

      {/* Background Overlay */}
      <div
        className="
          absolute
          inset-0
          bg-auto
          bg-center
          opacity-20
          pointer-events-none
          transition-all
          duration-100
        "
        style={{
          backgroundImage: `url('${foundUnit.chapter.backgroundImage}')`,
        }}
      />

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {!isQuestionSection ? (
          // Video Section with Vertical Sliding
          <motion.div
            key={`video-${foundUnit.unit.id}`}
            variants={verticalSlide}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <div className="w-full h-full flex flex-col text-3xl text-center font-custom1 items-center justify-center relative">
              <div className="h-fit w-fit bg-black items-center justify-center border border-secondary">
                <ReactPlayer
                  url={currentVideo.videoUrl}
                  playing
                  controls
                  height="30vw"
                  width="53vw"
                  onEnded={handleVideoEnd}
                />
              </div>
              {/* Display Chapter Title */}
              
                
              
              <motion.h3
                className="pl-24 absolute top-6 left-4 text-white text-left"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <p className='font-custom2 text-sm text-zinc-100'>{foundUnit.chapter.title}</p>
                <p>{currentVideo.title}</p>
                
              </motion.h3>
              
            </div>
          </motion.div>
        ) : (
          // Questions Section with Horizontal Sliding
          <motion.div
            key={`questions-${foundUnit.unit.id}`}
            variants={verticalSlide}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute w-full h-full flex flex-col items-center justify-center"
          >
            <div className="w-full flex flex-col items-center max-w-2xl py-20 px-20 relative border bg-black bg-opacity-30 rounded-lg border-secondary">
              {/* Questions Section Title Overlay */}
              <h3 className='top-2 flex flex-col items-center text-center font-custom2 text-sm bg-opacity-75 text-white px-3 py-1 rounded'>{foundUnit.chapter.title}</h3>
              <h2 className=" top-6 flex flex-col items-center text-center font-custom1 text-3xl bg-opacity-75 text-white px-3 py-1 rounded">
                {currentVideo.title}
                <div className="mt-6 h-[1px] w-40 bg-secondary"></div>
              </h2>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  variants={horizontalSlide}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6 mt-10 text-center border-1-secondary z-30"
                >
                  <h3 className="text-xl opacity-70 font-custom1 z-20">
                    Question {currentQuestionIndex + 1} of {currentVideo.questions.length}
                  </h3>
                  <p className="text-2xl">{currentQuestion.question}</p>
                  <div className="space-y-4">
                    {currentQuestion.options.map((option: string, idx: number) => (
                      <button
                        key={idx}
                        className={`w-full px-4 py-2 bg-zinc-950 rounded hover:bg-zinc-700 hover:border-1-secondary transition-colors text-center text-white text-lg ${
                          isLocked ? "cursor-not-allowed opacity-50" : ""
                        }`}
                        onClick={() => handleAnswerSelection(option)}
                        disabled={isLocked}
                        aria-label={`Answer option ${option}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {/* Error Message */}
                  {isLocked && (
                    <div className="text-red-500 mt-4">
                      Whoops! That was not correct. Wait {cooldownTime} seconds to try again!
                    </div>
                  )}
                  {/* Back to Video Button */}
                  {hasWrongAnswer && (
                    <button
                      className="mt-6 px-4 py-2 bg-secondary rounded hover:bg-secondary-foreground transition-colors text-black text-lg"
                      onClick={() => setIsQuestionSection(false)}
                    >
                      ← Back to Video
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseClientComponent;
