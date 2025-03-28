"use client";

import courseData from "@/app/_components/(semester1)/courseData";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { saveQuestionProgress, saveUnitProgress } from "@/lib/progress-service";
import axios from "axios";

interface QuestionState {
  isAnswered: boolean;
  isCorrect: boolean;
  retryTime: number | null;
  attempts: number;
  completedAt: number | null;
  incorrectAnswers: string[];
}

export default function QuizPage() {
  const router = useRouter();
  const { semesterId, chapterId, unitId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [questionStates, setQuestionStates] = useState<{[key: string]: QuestionState}>({});
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  
  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === chapterId);
  const unit = chapter?.units.find(u => u.id === unitId);
  const questions = unit?.video?.questions || [];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (retryCountdown !== null && retryCountdown > 0) {
      timer = setTimeout(() => {
        setRetryCountdown(prev => prev !== null ? prev - 1 : null);
      }, 1000);
    } else if (retryCountdown === 0) {
      setRetryCountdown(null);
      // Reset question state to allow retry, but preserve attempts and incorrect answers
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
      // Clear the selected answer for this question
      setSelectedAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestion.id];
        return newAnswers;
      });
    }
    return () => clearTimeout(timer);
  }, [retryCountdown, questions, currentQuestionIndex]);

  if (!unit?.video?.questions) {
    return <div className="text-white">Quiz not found</div>;
  }

  const handleAnswerSelect = async (questionId: string, answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    const currentState = questionStates[questionId] || {
      isAnswered: false,
      isCorrect: false,
      retryTime: null,
      attempts: 0,
      completedAt: null,
      incorrectAnswers: []
    };
    
    // Update question state
    const newState = {
      ...currentState,
      isAnswered: true,
      isCorrect,
      retryTime: isCorrect ? null : Date.now() + 10000,
      attempts: currentState.attempts + 1,
      completedAt: isCorrect ? Date.now() : null,
      incorrectAnswers: isCorrect 
        ? currentState.incorrectAnswers 
        : [...currentState.incorrectAnswers, answer]
    };

    setQuestionStates(prev => ({
      ...prev,
      [questionId]: newState
    }));

    // Save selected answer
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    try {
      // Save progress data
      const progressData = {
        questionId,
        unitId,
        chapterId,
        attempts: newState.attempts,
        completedAt: newState.completedAt ? new Date(newState.completedAt).toISOString() : null,
        incorrectAnswers: newState.incorrectAnswers
      };

      // Save both basic and detailed progress
      const [basicProgressResponse, detailedProgressResponse] = await Promise.all([
        saveQuestionProgress(
          unitId as string,
          chapterId as string,
          questionId,
          isCorrect
        ),
        axios.post('/api/progress/quiz/details', progressData)
      ]);

      console.log("Progress save responses:", {
        basic: basicProgressResponse,
        detailed: detailedProgressResponse.data
      });

      if (isCorrect) {
        // If this was the last question, mark unit as completed
        if (currentQuestionIndex === questions.length - 1) {
          await saveUnitProgress(
            unitId as string,
            chapterId as string,
            true,
            true
          );
          
          // Navigate to next unit after a delay
          setTimeout(() => {
            const currentUnitIndex = chapter?.units.findIndex(u => u.id === unitId);
            const nextUnit = currentUnitIndex !== undefined && currentUnitIndex !== -1
              ? chapter?.units[currentUnitIndex + 1]
              : null;
            if (nextUnit) {
              router.push(`/course/${semesterId}/${chapterId}/${nextUnit.id}/video`);
            }
          }, 1500);
        } else {
          // Move to next question after a short delay
          setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
          }, 1000);
        }
      } else {
        // Start retry countdown for incorrect answers
        setRetryCountdown(10);
      }
    } catch (error) {
      console.error("Error saving progress:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
      }
      // Show error to user
      alert("Failed to save progress. Please try again.");
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionState = questionStates[currentQuestion.id];

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="fixed top-15 left-0 right-0 p-20 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-gray-800 h-[2px]">
            <motion.div 
              className="bg-secondary h-full"
              initial={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-32 px-8 max-w-4xl font-morion mx-auto relative z-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="ml-6 space-y-8"
          >
            <div className="flex justify-between items-center text-white tracking-widest text-sm">
              <span>QUESTION {currentQuestionIndex + 1} OF {questions.length}</span>
              {currentQuestionState?.attempts > 0 && (
                <span className="text-xs sm:text-sm">Attempts: {currentQuestionState.attempts}</span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl text-white font-light leading-tight">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4 pt-8 relative">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswers[currentQuestion.id] === option;
                const showResult = currentQuestionState?.isAnswered && isSelected;
                const isCorrectAnswer = option === currentQuestion.correctAnswer;
                const wasIncorrectlySelected = currentQuestionState?.incorrectAnswers.includes(option);

                return (
                  <button
                    key={option}
                    onClick={() => {
                      if (!currentQuestionState?.isAnswered && !retryCountdown) {
                        handleAnswerSelect(currentQuestion.id, option);
                      }
                    }}
                    disabled={currentQuestionState?.isAnswered || retryCountdown !== null}
                    className={`
                      relative z-50 w-full text-white text-left p-6 border rounded-sm transition-all
                      ${isSelected
                        ? showResult
                          ? isCorrectAnswer
                            ? 'border-green-500 bg-green-500/10 text-green-500'
                            : 'border-red-500 bg-red-500/10 text-red-500'
                          : 'border-secondary bg-secondary/10 text-secondary'
                        : wasIncorrectlySelected
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-gray-800 hover:border-gray-700'
                      }
                      ${(currentQuestionState?.isAnswered || retryCountdown !== null) 
                        ? 'cursor-not-allowed opacity-75' 
                        : 'cursor-pointer'
                      }
                    `}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Feedback Messages */}
            <AnimatePresence>
              {currentQuestionState?.isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mt-4 p-4 rounded-sm relative z-50 ${
                    currentQuestionState.isCorrect
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {currentQuestionState.isCorrect ? (
                    <div>
                      <p>Correct! {currentQuestionIndex < questions.length - 1 ? "Moving to next question..." : "Quiz completed!"}</p>
                      <p className="text-sm mt-1 opacity-75">
                        Completed in {currentQuestionState.attempts} {currentQuestionState.attempts === 1 ? 'attempt' : 'attempts'}
                      </p>
                    </div>
                  ) : (
                    <p>
                      Incorrect. You can try again in{" "}
                      <span className="font-bold">{retryCountdown}</span> seconds.
                      {currentQuestionState.attempts > 1 && (
                        <span className="block text-sm mt-1 opacity-75">
                          Attempt {currentQuestionState.attempts}
                        </span>
                      )}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
} 