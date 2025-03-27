"use client";

import courseData from "@/app/_components/(semester1)/courseData";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { saveQuestionProgress, saveUnitProgress } from "@/lib/progress-service";

export default function QuizPage() {
  const { semesterId, chapterId, unitId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  
  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === chapterId);
  const unit = chapter?.units.find(u => u.id === unitId);
  const questions = unit?.video?.questions || [];

  if (!unit?.video?.questions) {
    return <div className="text-white">Quiz not found</div>;
  }

  const handleAnswerSelect = async (questionId: string, answer: string) => {
    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
    
    // Save question progress
    await saveQuestionProgress(
      unitId as string,
      chapterId as string,
      questionId,
      isCorrect
    );

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // If this was the last question and it was correct, mark unit as completed
    if (currentQuestionIndex === questions.length - 1 && isCorrect) {
      await saveUnitProgress(
        unitId as string,
        chapterId as string,
        true, // videoCompleted (assuming they watched the video first)
        true  // questionsCompleted
      );
    }
    
    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 500);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="relative">
      {/* Main Content */}
      <main className="pt-32 px-8 max-w-4xl font-morion mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-white tracking-widest text-sm">
              QUESTION {currentQuestionIndex + 1}
            </div>

            <h2 className="text-4xl text-white font-light leading-tight">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4 pt-8">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                  className={`w-full text-white text-left p-6 border rounded-sm transition-all
                    ${selectedAnswers[currentQuestion.id] === option
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-gray-800 hover:border-gray-700'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Progress Bar */}
      <div className="fixed top-15 left-0 right-0 p-20">
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-gray-800 h-[2px]">
            <div 
              className="bg-secondary h-full transition-all"
              style={{ 
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 