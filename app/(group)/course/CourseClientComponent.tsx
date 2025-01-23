// src/app/course/CourseClientComponent.tsx

'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import courseData from '@/app/_components/(semester1)/courseData';
import { useProgress } from '@/context/ProgressContext';
import Notes from './_components/Noteopener';
import { Semester, Chapter, Unit } from '@/types/course';
import { NotesContext } from '@/context/NotesContext';

interface FoundUnit {
  semester: Semester;
  chapter: Chapter;
  unit: Unit;
}

const CourseClientComponent: React.FC = () => {
  const { status } = useSession(); // Removed 'session'
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isNotesOpen } = useContext(NotesContext); // Consume the context

  const { markUnitAsCompleted } = useProgress(); // Removed 'completedUnits'

  const [foundUnit, setFoundUnit] = useState<FoundUnit | null>(null);

  const [isQuestionSection, setIsQuestionSection] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasWrongAnswer, setHasWrongAnswer] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Custom Controls State
  const playerRef = useRef<ReactPlayer>(null); // Reference to ReactPlayer
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

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
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  };

  const horizontalSlide = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: '0%', opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: {
      duration: 0.7,
      ease: "easeInOut",
    },
  };

  // Custom Control Handlers
  const togglePlayPause = () => {
    setPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    // if volume > 0, unmute
    if (value > 0) {
      setMuted(false);
    }
  };


  const handleProgress = (state: { played: number }) => {
    setPlayed(state.played);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    playerRef.current?.seekTo(seekTo);
    setPlayed(seekTo);
  };

  const handleDuration = (dur: number) => {
    setDuration(dur);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const toggleFullScreen = () => {
    const playerContainer = containerRef.current;
    if (!playerContainer) return;

    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Handler for 15 seconds backward
const handleBackward = () => {
  if (playerRef.current) {
    const currentTime = playerRef.current.getCurrentTime();
    const newTime = Math.max(currentTime - 15, 0); // Prevent negative time
    playerRef.current.seekTo(newTime, 'seconds');
    setPlayed(newTime / duration);
  }
};

// Handler for 15 seconds forward
/*const handleForward = () => {
  if (playerRef.current) {
    const currentTime = playerRef.current.getCurrentTime();
    const newTime = Math.min(currentTime + 15, duration); // Prevent exceeding duration
    playerRef.current.seekTo(newTime, 'seconds');
    setPlayed(newTime / duration);
  }
};*/


  // Handler to disable context menu
  const disableContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative flex flex-row w-screen h-screen text-white">
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
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-full flex flex-col items-center justify-center"
          >
            <div className={`relative flex flex-col justify-center w-screen h-screen text-white ${isNotesOpen ? 'items-start pl-28' : 'items-center'}`}
            >
              {/* Container with Context Menu Disabled and Group for Hover */}
              <div
                className="md:h-fit md:w-[65vw] bg-black items-center justify-center border border-secondary relative group"
                onContextMenu={disableContextMenu} // Disable context menu here
              >
                {/* ReactPlayer with Custom Controls */}
                <ReactPlayer
                  ref={playerRef}
                  url={currentVideo.videoUrl}
                  playing={playing}
                  controls={false} // Disable default controls
                  height="100%"
                  width="100%"
                  onEnded={handleVideoEnd}
                  muted={muted}
                  onProgress={handleProgress}
                  onDuration={handleDuration}
                  onDoubleClick={toggleFullScreen}
                  onClick={togglePlayPause}
                  onScroll={handleVolumeChange}
                  />

                {/* Custom Controls Overlay */}
                <div
                  className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    flex
                    flex-col
                    items-center
                    justify-center
                    px-4
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    duration-500
                    bg-gradient-to-t
                    from-black
                    z-10
                    text-xs
                  "
                >
                  {/* Progress Bar */}
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step="0.001"
                    value={played}
                    onChange={handleSeekChange}
                    className="w-full h-10 bg-white"
                    aria-label="Progress Bar"
                  />
                  <div className="w-full flex justify-between text-sm mb-2">
                    <span>{formatTime(played * duration)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center mb-2 space-x-10">
                    {/* Backward 15 Seconds Button */}
                      <button
                        onClick={handleBackward}
                        className="flex items-center md:text-lg justify-center px-4 text-zinc-400 hover:text-zinc-200 transition"
                        aria-label="Rewind 15 seconds"
                      >
                        ← 15s
                      </button>

                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlayPause}
                      className="flex items-center md:text-lg justify-center px-4 text-zinc-400  hover:text-zinc-200 transition"
                      aria-label={playing ? "Pause" : "Play"}
                    >
                      
                      <span className="ml-2">{playing ? 'Pause' : 'Play'}</span>
                    </button>

                    {/* Mute/Unmute Button */}
                    <button
                      onClick={toggleMute}
                      className="flex items-center md:text-lg justify-center px-4 text-zinc-400  hover:text-zinc-200 transition"
                      aria-label={muted ? "Unmute" : "Mute"}
                    >
                      <span className="ml-2">{muted || volume === 0 ? 'Unmute' : 'Mute'}</span>
                    </button>

                    {/* Volume Slider 
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step="0.01"
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-32"
                      aria-label="Volume Control"
                    />*/}

                    {/* Fullscreen Toggle */}
                    <button
                      onClick={toggleFullScreen}
                      className="flex items-center md:text-lg justify-center px-4 text-zinc-400  hover:text-zinc-200 transition"
                      aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                    >
                    
                      <span className="ml-2">{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}</span>
                    </button>
                    
                  </div>
                  </div> 
                
              </div> 

              {/* Display Chapter Title */}
              <motion.h3
                className="pl-24 absolute top-6 left-4 text-white text-left"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <p className='font-custom2 w-48 md:w-full text-xs md:text-sm text-zinc-100'>{foundUnit.chapter.title}</p>
                <p className='font-custom1 w-48 md:w-full text-sm md:text-2xl'>{currentVideo.title}</p>
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
            <div className="w-fit flex flex-col items-center max-w-2xl mx-5 md:mx-0 py-5 md:py-20 px-5 md:px-20 relative border bg-black bg-opacity-30 rounded-lg border-secondary">
              {/* Questions Section Title Overlay */}
              <h3 className='hidden top-2 md:flex flex-col items-center text-center font-custom2 text-xs md:text-lg bg-opacity-75 text-white px-3 py-1 rounded'>{foundUnit.chapter.title}</h3>
              <h2 className="w-full top-6 flex flex-col items-center text-center font-custom1 text-basde md:text-3xl bg-opacity-75 text-white px-3 py-1 rounded">
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
                  className="space-y-6 mt-4 md:mt-10 text-center border-1-secondary z-30"
                >
                  <h3 className="text-base md:text-xl opacity-70 font-custom1 z-20">
                    Question {currentQuestionIndex + 1} of {currentVideo.questions.length}
                  </h3>
                  <p className="text-base md:text-2xl">{currentQuestion.question}</p>
                  <div className="space-y-4">
                    {currentQuestion.options.map((option: string, idx: number) => (
                      <button
                        key={idx}
                        className={`w-full px-4 py-2 text-sm bg-zinc-950 rounded hover:bg-zinc-700 hover:border-1-secondary transition-colors text-center text-white md:text-lg ${
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
                    <div className="text-red-500 text-xs md: text-sm mt-4">
                      Whoops! That was not correct. Wait {cooldownTime} seconds to try again!
                    </div>
                  )}
                  {/* Back to Video Button */}
                  {hasWrongAnswer && (
                    <button
                      className="mt-6 px-4 py-2 bg-secondary rounded hover:bg-secondary-foreground transition-colors text-black text-sm md:text-lg"
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
