// pages/CoursePage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import course1Data from '@/app/_components/(semester1)/course1Data';


const CoursePage: React.FC = () => { 
  // 1) Auth session & router
  const { data: session, status } = useSession();
  const router = useRouter();

  // 2) Get ?session=<index> from URL
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");
  const initialIndex = sessionParam ? parseInt(sessionParam, 10) : 0;

  // 3) Local state for course logic
  // **Important**: Use initialIndex here!
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(initialIndex);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [isQuestions, setIsQuestions] = useState(false);
  const [hasWrongAnswer, setHasWrongAnswer] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  // 4) Parallax state
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 });

  // 5) Derive current video & question
  const currentVideo = course1Data[currentVideoIndex];
  const currentQuestion = currentVideo.questions[currentQuestionIndex];


  // 6) useEffect hooks

  // 6A) Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // 6B) Handle 20-second lockout countdown
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

  // 6C) Parallax background effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const speedFactor = 5;
      const xFrac = e.clientX / window.innerWidth;
      const yFrac = e.clientY / window.innerHeight;
      setBgPos({
        x: 50 - (2 - xFrac) * speedFactor,
        y: 50 - (2 - yFrac) * speedFactor,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // If session is still loading, show a loading state
  if (status === "loading") {
    return (
      <p className="text-white h-screen flex items-center justify-center">
        Loading session...
      </p>
    );
  }

  // 7) Animation Variants
  const sectionVariants = {
    initial: { y: "50%", opacity: 0 },
    animate: { y: "0%", opacity: 1 },
    exit: { y: "-50%", opacity: 0 },
  };

  const questionVariants = {
    initial: { x: "50%", opacity: 0 },
    animate: { x: "0%", opacity: 1 },
    exit: { x: "-25%", opacity: 0 },
  };

  // 8) Helper to update user progress in DB (optional)
  async function updateProgressInDB(newSessionIndex: number) {
    if (!session?.user?.email) return;
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newSessionIndex }),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error("Error updating progress:", data.error);
      } else {
        console.log("Progress updated successfully");
      }
    } catch (err) {
      console.error("Progress update error:", err);
    }
  }

  // 9) Handlers

  const handleVideoEnd = () => {
    setIsQuestions(true);
  };

  const handleCorrectAnswer = async () => {
    if (currentQuestionIndex < currentVideo.questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Mark section as completed
      setCompletedSections([...completedSections, currentVideo.id]);

      // Update DB progress
      const nextSessionIndex = currentVideoIndex + 1;
      await updateProgressInDB(nextSessionIndex);

      if (currentVideoIndex < course1Data.length - 1) {
        // Move to next video
        setCurrentVideoIndex(currentVideoIndex + 1);
        setCurrentQuestionIndex(0);
        setIsQuestions(false);
      } else {
        // Course completed
        setCompletedSections([...completedSections, currentVideo.id]);
        alert("🎉 Congratulations! You have completed the course.");
      }
    }
  };

  const handleDotClick = (index: number) => {
    if (completedSections.includes(course1Data[index].id)) {
      setCurrentVideoIndex(index);
      setCurrentQuestionIndex(0);
      setIsQuestions(false);
      setHasWrongAnswer(false);
    }
  };

  const checkAnswer = (selected: string) => {
    if (isLocked) return;
    if (selected === currentQuestion.correctAnswer) {
      handleCorrectAnswer();
      setHasWrongAnswer(false);
    } else {
      setHasWrongAnswer(true);
      setIsLocked(true);
      setCooldownTime(20);
    }
  };

    return (
      <div className="relative w-full h-screen bg-black text-white ">
        
        <div
        className="
          w-[120vw]
          h-[120vh]
          absolute
          inset-0
          bg-auto
          bg-center
          opacity-35
          pointer-events-none
          transition-all
          duration-100
          
        "
        style={{
          backgroundImage: `url('/creationofadam.jpg')`,
          backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
        }}
      />

        {/* Progress Dots */}
        <div className="fixed top-1/2 right-4 transform -translate-y-1/2 flex flex-col items-center space-y-10 z-10">
          {course1Data.map((video, index) => (
            <button
              key={video.id}
              className={`w-2 h-2 rounded-full ${
                currentVideoIndex === index && !isQuestions
                  ? "bg-secondary w-3 h-3"
                  : completedSections.includes(video.id)
                  ? "bg-secondary-foreground"
                  : "bg-gray-600"
              } cursor-pointer transition-colors`}
              onClick={() => handleDotClick(index)}
              disabled={!completedSections.includes(video.id)}
              title={video.title}
            ></button>
          ))}
        </div>

        {/* Sections Container */}
        <AnimatePresence initial={false} mode="wait">
          {!isQuestions ? (
             

            // Video Section
            <motion.div
              key={`video-${currentVideo.id}`}
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute w-full h-full flex items-center justify-center"
            >

              <div className="w-full h-full flex text-3xl text-center font-custom1 flex-col items-center justify-center relative">
                <div className=' h-fit w-fitflex flex-col items-center justify-center border border-secondary'>
                <ReactPlayer
                  url={currentVideo.videoUrl}
                  
                  controls
                  height="30vw"
                  width="53vw"
                  onEnded={handleVideoEnd}
                />
              </div>
                {/* Video Title Overlay */}
                <h2 className="absolute top-4 left-4 text-white px-3 py-1 rounded">
                  {currentVideo.title}
                </h2>
              </div>
            </motion.div>
          ) : (
            // Questions Section
            <motion.div
              key={`questions-${currentVideo.id}`}
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute w-full h-full flex flex-col items-center justify-center"
            >
              <div className="w-full flex flex-col items-center max-w-2xl py-20 px-20 relative border bg-black bg-opacity-30 rounded-lg border-secondary">
              
                {/* Questions Section Title Overlay */}
                <h2 className="absolute top-4 flex flex-col items-center text-center font-custom1 text-3xl bg-opacity-75 text-white px-3 py-1 rounded"
                
                >
                  {currentVideo.title}
                  <div className='mt-8 h-[1px] w-40 bg-secondary'></div>
                </h2>

              
  
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.id}
                    variants={questionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="space-y-6 mt-10 text-center border-1-secondary z-30"
                  >
                   

                    <h3 className="text-xl opacity-70 font-custom1 z-20">
                      Question {currentQuestionIndex + 1} of{" "}
                      {currentVideo.questions.length}
                    </h3>
                    <p className="text-lg">{currentQuestion.question}</p>
                    <div className="space-y-4">
                      {currentQuestion.options.map((option, idx) => (
                        <button
                          key={idx}
                          className={`w-full px-4 py-2 bg-zinc-950 rounded hover:bg-zinc-700 transition-colors text-left text-white text-lg ${
                            isLocked ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          onClick={() => checkAnswer(option)}
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
                        Whoops! That was not correct. Wait {cooldownTime} seconds to try
                        again!
                      </div>
                    )}
                    {/* Back to Video Button */}
                    {hasWrongAnswer && (
                      <button
                        className="mt-6 px-4 py-2 bg-secondary rounded hover:bg-secondary-foreground transition-colors text-black text-lg"
                        onClick={() => setIsQuestions(false)}
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
  
  export default CoursePage;