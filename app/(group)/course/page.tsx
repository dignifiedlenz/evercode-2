// pages/CoursePage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Define types for Questions and Video Sections
type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

type VideoSection = {
  id: number;
  title: string;
  videoUrl: string;
  questions: Question[];
};

// Sample course data with 5 video sections and corresponding questions
const courseData: VideoSection[] = [
  {
    id: 1,
    title: '3.7.1 Introduction to the Apostles’ Creed',
    videoUrl: 'https://d3umrizzn3mmk.cloudfront.net/3.7.1+I+believe+in+God.mp4', // Replace with your S3 link
    questions: [
      {
        id: 1,
        question: 'What is the first line of the Apostles’ Creed?',
        options: [
          'I believe in God, the Father Almighty',
          'I believe in Jesus Christ',
          'I believe in the Holy Spirit',
          'I believe in the Church',
        ],
        correctAnswer: 'I believe in God, the Father Almighty',
      },
      {
        id: 2,
        question: 'Who is the creator according to the Creed?',
        options: [
          'Jesus Christ',
          'The Holy Spirit',
          'God the Father Almighty',
          'The Apostles',
        ],
        correctAnswer: 'God the Father Almighty',
      },
      {
        id: 3,
        question: 'What does the Creed affirm about Jesus Christ?',
        options: [
          'His mortality',
          'His divinity',
          'His writings',
          'His teachings',
        ],
        correctAnswer: 'His divinity',
      },
      {
        id: 4,
        question: 'According to the Creed, what did Jesus do?',
        options: [
          'Built the church',
          'Suffered under Pontius Pilate',
          'Wrote the Bible',
          'Traveled the world',
        ],
        correctAnswer: 'Suffered under Pontius Pilate',
      },
      {
        id: 5,
        question: 'What does the Creed say about the Holy Spirit?',
        options: [
          'He is a prophet',
          'He is a teacher',
          'He is the giver of life',
          'He is a servant',
        ],
        correctAnswer: 'He is the giver of life',
      },
    ],
  },
  {
    id: 2,
    title: 'The Nature of God',
    videoUrl: 'https://d3umrizzn3mmk.cloudfront.net/3.7.2+The+Father+Almighty%2C+Creator+of+heaven+and+earth.mp4', // Replace with your S3 link
    questions: [
      {
        id: 1,
        question: 'How does the Creed describe God?',
        options: [
          'Omniscient and omnipotent',
          'Limited in power',
          'Only a distant creator',
          'As a mythical figure',
        ],
        correctAnswer: 'Omniscient and omnipotent',
      },
      {
        id: 2,
        question: 'What does "Almighty" signify about God?',
        options: [
          'His age',
          'His power',
          'His location',
          'His knowledge',
        ],
        correctAnswer: 'His power',
      },
      {
        id: 3,
        question: 'According to the Creed, God is the creator of:',
        options: [
          'Only the heavens',
          'Only the earth',
          'All things',
          'None of the above',
        ],
        correctAnswer: 'All things',
      },
      {
        id: 4,
        question: 'The Creed affirms God as:',
        options: [
          'A single entity',
          'A triune being',
          'Multiple gods',
          'An abstract concept',
        ],
        correctAnswer: 'A triune being',
      },
      {
        id: 5,
        question: 'Which attribute is NOT associated with God in the Creed?',
        options: [
          'Eternal',
          'Invisible',
          'Immovable',
          'Human-like',
        ],
        correctAnswer: 'Human-like',
      },
    ],
  },
  {
    id: 3,
    title: 'Jesus Christ in the Creed',
    videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Replace with your S3 link
    questions: [
      {
        id: 1,
        question: 'What does the Creed state about Jesus’ birth?',
        options: [
          'Born in Nazareth',
          'Born of the Virgin Mary',
          'Born in a manger',
          'Born under a star',
        ],
        correctAnswer: 'Born of the Virgin Mary',
      },
      {
        id: 2,
        question: 'According to the Creed, Jesus suffered under:',
        options: [
          'King Herod',
          'Pontius Pilate',
          'Roman soldiers',
          'Both b and c',
        ],
        correctAnswer: 'Pontius Pilate',
      },
      {
        id: 3,
        question: 'What does the Creed say Jesus did on the third day?',
        options: [
          'Ascended to heaven',
          'Was resurrected',
          'Performed miracles',
          'Baptized disciples',
        ],
        correctAnswer: 'Was resurrected',
      },
      {
        id: 4,
        question: 'Where did Jesus ascend according to the Creed?',
        options: [
          'To the temple',
          'To the mountaintop',
          'Into heaven',
          'To Jerusalem',
        ],
        correctAnswer: 'Into heaven',
      },
      {
        id: 5,
        question: 'The Creed professes Jesus will come to judge:',
        options: [
          'The living',
          'The dead',
          'Both the living and the dead',
          'None of the above',
        ],
        correctAnswer: 'Both the living and the dead',
      },
    ],
  },
  {
    id: 4,
    title: 'The Holy Spirit and the Church',
    videoUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ', // Replace with your S3 link
    questions: [
      {
        id: 1,
        question: 'What role does the Holy Spirit play according to the Creed?',
        options: [
          'Creator',
          'Savior',
          'Giver of life',
          'Judge',
        ],
        correctAnswer: 'Giver of life',
      },
      {
        id: 2,
        question: 'The Creed affirms belief in the holy Church as:',
        options: [
          'A building',
          'The community of believers',
          'An organization',
          'A tradition',
        ],
        correctAnswer: 'The community of believers',
      },
      {
        id: 3,
        question: 'According to the Creed, the Church is:',
        options: [
          'Human-made',
          'Invisible',
          'Holy and universal',
          'Limited to certain regions',
        ],
        correctAnswer: 'Holy and universal',
      },
      {
        id: 4,
        question: 'What does the Creed say about the communion of saints?',
        options: [
          'It is symbolic',
          'It includes all believers',
          'It is optional',
          'It is historical',
        ],
        correctAnswer: 'It includes all believers',
      },
      {
        id: 5,
        question: 'The Creed mentions the forgiveness of sins:',
        options: [
          'Only through good deeds',
          'Through Jesus Christ',
          'By personal effort',
          'Not at all',
        ],
        correctAnswer: 'Through Jesus Christ',
      },
    ],
  },
  {
    id: 5,
    title: 'Eternal Life and Resurrection',
    videoUrl: 'https://www.youtube.com/watch?v=l482T0yNkeo', // Replace with your S3 link
    questions: [
      {
        id: 1,
        question: 'What does the Creed affirm about eternal life?',
        options: [
          'It is a metaphor',
          'Believers will receive it',
          'It is uncertain',
          'It is earned by works',
        ],
        correctAnswer: 'Believers will receive it',
      },
      {
        id: 2,
        question: 'According to the Creed, Jesus will come to:',
        options: [
          'Proclaim peace',
          'Rule the world',
          'Judge the living and the dead',
          'Perform miracles',
        ],
        correctAnswer: 'Judge the living and the dead',
      },
      {
        id: 3,
        question: 'The Creed speaks of Jesus’ return as:',
        options: [
          'A past event',
          'A future hope',
          'A symbolic idea',
          'An unknown mystery',
        ],
        correctAnswer: 'A future hope',
      },
      {
        id: 4,
        question: 'Resurrection in the Creed refers to:',
        options: [
          'Only Jesus',
          'All people',
          'Only the righteous',
          'Only the saints',
        ],
        correctAnswer: 'All people',
      },
      {
        id: 5,
        question: 'Eternal life according to the Creed is in:',
        options: [
          'Heaven only',
          'Earth only',
          'Heaven and earth',
          'A spiritual realm',
        ],
        correctAnswer: 'Heaven and earth',
      },
    ],
  },
];

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
  const currentVideo = courseData[currentVideoIndex];
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
      const speedFactor = 0.1;
      const xFrac = e.clientX / window.innerWidth;
      const yFrac = e.clientY / window.innerHeight;
      setBgPos({
        x: 50 - (0.2 - xFrac) * speedFactor,
        y: 50 - (0.2 - yFrac) * speedFactor,
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

      if (currentVideoIndex < courseData.length - 1) {
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
    if (completedSections.includes(courseData[index].id)) {
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
          backgroundImage: `url('/308850rg.jpg')`,
          backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
        }}
      />

        {/* Progress Dots */}
        <div className="fixed top-1/2 right-4 transform -translate-y-1/2 flex flex-col items-center space-y-10 z-10">
          {courseData.map((video, index) => (
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