"use client";

import courseData from "@/app/_components/(semester1)/courseData";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useProgress } from "@/app/_components/ProgressClient";
import QuizNavBar from "../../../components/QuizNavBar";
import UnitHeader from "../_components/UnitHeader";

interface QuestionState {
  isAnswered: boolean;
  isCorrect: boolean;
  retryTime: number | null;
  attempts: number;
  completedAt: number | null;
  incorrectAnswers: string[];
  isNewAnswer: boolean;
}

// Adjusted variants for minimal horizontal movement
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "15%" : "-15%", // Minimal travel
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "15%" : "-15%", // Minimal travel
    opacity: 0,
  }),
};

export default function QuizPage() {
  const router = useRouter();
  const { semesterId, chapterId, unitId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [questionStates, setQuestionStates] = useState<{[key: string]: QuestionState}>({});
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const { trackQuestionProgress, trackUnitProgress, progress: progressData, loading: isLoadingProgress } = useProgress();
  
  // Restore direction state
  const [direction, setDirection] = useState(1);
  const prevIndexRef = useRef(currentQuestionIndex);

  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === chapterId);
  const unit = chapter?.units.find(u => u.id === unitId);
  const questions = unit?.video?.questions || [];

  // Restore effect for tracking prev index
  useEffect(() => {
     prevIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (retryCountdown !== null && retryCountdown > 0) {
      timer = setTimeout(() => {
        setRetryCountdown(prev => prev !== null ? prev - 1 : null);
      }, 1000);
    } else if (retryCountdown === 0) {
      setRetryCountdown(null);
      const currentQuestion = questions[currentQuestionIndex];
      setQuestionStates(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          isAnswered: false, 
          isCorrect: false,
          retryTime: null,
        }
      }));
      setSelectedAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestion.id];
        return newAnswers;
      });
    }
    return () => clearTimeout(timer);
  }, [retryCountdown, questions, currentQuestionIndex]);

  // Initialize question states from progress data
  useEffect(() => {
    if (!isLoadingProgress && progressData?.questionProgress) {
      const newQuestionStates: { [key: string]: QuestionState } = {};
      const newSelectedAnswers: { [key: string]: string } = {};

      questions.forEach(question => {
        const questionProgress = progressData.questionProgress.find(qp => qp.questionId === question.id);
        if (questionProgress) {
          newQuestionStates[question.id] = {
            isAnswered: true,
            isCorrect: questionProgress.correct,
            retryTime: null,
            attempts: 1,
            completedAt: Date.now(),
            incorrectAnswers: [],
            isNewAnswer: false
          };
        } else {
          newQuestionStates[question.id] = {
            isAnswered: false,
            isCorrect: false,
            retryTime: null,
            attempts: 0,
            completedAt: null,
            incorrectAnswers: [],
            isNewAnswer: false
          };
        }
      });

      setQuestionStates(newQuestionStates);
      setSelectedAnswers({});
    }
  }, [isLoadingProgress, progressData?.questionProgress, questions]);

  // Update unit progress when question states change
  useEffect(() => {
    if (!isLoadingProgress && progressData) {
      let correctCount = 0;
      questions.forEach(question => {
        const questionProgress = progressData.questionProgress.find(qp => qp.questionId === question.id);
        if (questionProgress?.correct) {
          correctCount++;
        }
      });

      const currentUnitProgress = progressData.unitProgress?.find(up => up.unitId === unitId);
      const currentCorrectCount = currentUnitProgress?.questionsCompleted || 0;

      // Only update if the correct count has changed
      if (correctCount !== currentCorrectCount) {
        trackUnitProgress({
          unitId: unitId as string,
          questionsCompleted: correctCount,
          totalQuestions: questions.length,
          videoCompleted: currentUnitProgress?.videoCompleted || false
        });
      }
    }
  }, [isLoadingProgress, progressData, questions, unitId, trackUnitProgress]);

  if (!unit?.video?.questions) {
    return <div className="text-white">Quiz not found</div>;
  }
  
  // Restore direction setting in navigation
  const handleNavigateQuestion = (index: number) => {
     if (retryCountdown !== null) return;
     setDirection(index > currentQuestionIndex ? 1 : -1);
     setCurrentQuestionIndex(index);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    // Don't allow answering if already answered
    if (questionStates[questionId]?.isAnswered) {
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    const currentState = questionStates[questionId] || {
      isAnswered: false,
      isCorrect: false,
      retryTime: null,
      attempts: 0,
      completedAt: null,
      incorrectAnswers: [],
      isNewAnswer: true
    };
    
    const newState = {
      ...currentState,
      isAnswered: true,
      isCorrect,
      retryTime: isCorrect ? null : Date.now() + 10000,
      attempts: currentState.attempts + 1,
      completedAt: isCorrect ? Date.now() : null,
      incorrectAnswers: isCorrect 
        ? currentState.incorrectAnswers 
        : [...currentState.incorrectAnswers, answer],
      isNewAnswer: false
    };

    setQuestionStates(prev => ({
      ...prev,
      [questionId]: newState
    }));

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    trackQuestionProgress({
      questionId,
      unitId: unitId as string,
      correct: isCorrect
    });

    if (isCorrect) {
      // Calculate the total number of correct answers including the current one
      const updatedStates = { ...questionStates, [questionId]: newState };
      let calculatedCorrectCount = 0;
      
      // Count all correct answers
      questions.forEach(q => {
        if (updatedStates[q.id]?.isCorrect) {
          calculatedCorrectCount++;
        }
      });

      // Always update unit progress with latest count
      trackUnitProgress({
        unitId: unitId as string,
        questionsCompleted: calculatedCorrectCount,
        totalQuestions: questions.length,
        videoCompleted: progressData?.unitProgress?.find(up => up.unitId === unitId)?.videoCompleted || false
      });

      const allCorrect = calculatedCorrectCount >= questions.length;
      console.log("Question progress update:", { 
        calculatedCorrectCount, 
        totalQuestions: questions.length, 
        allCorrect 
      });

      if (allCorrect) {
        console.log(`All ${questions.length} questions correct. Marking unit quiz complete.`);
        setTimeout(() => {
          const currentUnitIdx = chapter?.units.findIndex(u => u.id === unitId);
          const nextUnit = currentUnitIdx !== undefined && currentUnitIdx !== -1
            ? chapter?.units[currentUnitIdx + 1]
            : null;
          if (nextUnit) {
            router.push(`/course/${semesterId}/${chapterId}/${nextUnit.id}/video`);
          } else {
            console.log("Last unit quiz completed, navigating back to chapter/dashboard (implement)");
          }
        }, 1500);
      } else if (currentQuestionIndex < questions.length - 1) {
        console.log("Correct answer, moving to next question.");
        setDirection(1); 
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
        }, 1000);
      }
    } else {
      console.log("Incorrect answer, starting retry countdown.");
      setRetryCountdown(10);
    }
  };

  // Restore single current question logic
  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionState = questionStates[currentQuestion.id];

  return (
    <div className="relative overflow-hidden min-h-screen pb-24 flex flex-col">
      <UnitHeader />
      {/* Navbar */} 
      <div className="pt-24 sm:pt-32">
          <QuizNavBar 
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            questionProgress={progressData?.questionProgress} 
            onNavigate={handleNavigateQuestion}
          />
      </div>

      {/* Restore flex centering container, removed overflow-hidden from here */}
      <main className="flex-grow flex items-center justify-center relative w-full px-4 font-morion z-10">
          {/* Restore AnimatePresence */}
          <AnimatePresence initial={false} custom={direction} mode="wait"> 
            {/* Restore motion.div for single question */}
            <motion.div
              key={currentQuestionIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 400, damping: 50 }, 
                opacity: { duration: 0.2 }
              }}
              // Restore width constraint and remove vertical padding
              className="w-full max-w-[60vw]" 
            >
              {/* Inner content structure */} 
              <div className="space-y-8">
                  <div className="flex px-2 justify-between items-center text-white tracking-widest text-sm">
                    <span>QUESTION {currentQuestionIndex + 1} OF {questions.length}</span>
                    {currentQuestionState?.attempts > 0 && (
                      <span className="text-xs sm:text-sm">Attempts: {currentQuestionState.attempts}</span>
                    )}
                  </div>

                  <h2 className="text-xl px-2 sm:text-2xl text-white font-light leading-tight">
                    {currentQuestion.question}
                  </h2>

                  <div className="space-y-4 pt-8 relative">
                    {currentQuestion.options.map((option) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === option;
                      const showResult = currentQuestionState?.isAnswered && isSelected;
                      const isCorrectAnswer = option === currentQuestion.correctAnswer;
                      const wasIncorrectlySelected = currentQuestionState?.incorrectAnswers.includes(option);
                      const isQuestionAttempted = currentQuestionState?.isAnswered;

                      return (
                        <button
                          key={option}
                          onClick={() => {
                            if (!isQuestionAttempted && !retryCountdown) {
                              handleAnswerSelect(currentQuestion.id, option);
                            }
                          }}
                          disabled={isQuestionAttempted || retryCountdown !== null}
                          className={`
                            relative z-50 w-full text-white text-left p-2 sm:p-6 border rounded-sm transition-all
                            ${showResult
                              ? (isCorrectAnswer ? 'border-secondary text-secondary' : 'border-red-500 bg-red-500/10 text-red-500')
                              : (isSelected ? 'border-secondary bg-secondary/10 text-secondary' : (wasIncorrectlySelected ? 'border-red-500/50 bg-red-500/5 opacity-60' : 'border-gray-800 hover:border-gray-700'))
                            }
                            ${(isQuestionAttempted || retryCountdown !== null) 
                              ? 'cursor-not-allowed' 
                              : 'cursor-pointer'
                            }
                            ${!isSelected && isQuestionAttempted && !isCorrectAnswer && option === currentQuestion.correctAnswer
                              ? '!border-secondary !text-secondary'
                              : ''
                            }
                          `}
                        >
                          {option}
                        </button>
                      );
                    })}
                    {retryCountdown !== null && (
                      <div className="text-center text-yellow-400 pt-4">
                        Incorrect. Please review and try again in {retryCountdown}s.
                      </div>
                    )}
                  </div>
                </div>
            </motion.div>
          </AnimatePresence>
       </main>
    </div>
  );
} 