"use client";

import React from 'react';
import { Check } from 'lucide-react';
import { Question } from '@/types/course'; // Changed import path
import { QuestionProgress } from '@/app/_components/ProgressClient'; // Assuming type export

interface QuizNavBarProps {
  questions: Question[];
  currentQuestionIndex: number;
  // We might not need questionStates if we solely rely on persistent progress
  // questionStates: { [key: string]: { isCorrect: boolean; attempts: number } }; 
  questionProgress?: QuestionProgress[]; // Progress data from the hook
  onNavigate: (index: number) => void;
}

const QuizNavBar: React.FC<QuizNavBarProps> = ({ 
  questions, 
  currentQuestionIndex, 
  questionProgress, 
  onNavigate 
}) => {
  
  // Helper to check persistent correctness
  const isQuestionCorrectlyAnswered = (questionId: string): boolean => {
    return !!questionProgress?.some(qp => qp.questionId === questionId && qp.correct);
  };

  return (
    // Changed positioning: No longer fixed, part of the normal flow
    // Added padding and centering within its container
    <div className="w-full px-4 py-6">
      <div className="max-w-4xl mx-auto flex justify-center items-center">
        {questions.map((question, index) => {
          const isCurrent = index === currentQuestionIndex;
          const isCompleted = isQuestionCorrectlyAnswered(question.id);

          // Determine if the line leading to this node should be colored
          const prevNodeCompleted = index > 0 && isQuestionCorrectlyAnswered(questions[index - 1].id);
          const lineIsActive = isCompleted || isCurrent || prevNodeCompleted;

          return (
            <React.Fragment key={question.id}>
              {/* Line before the node (except for the first one) */} 
              {index > 0 && (
                <div className={`flex-1 h-[1px] sm:h-[2px] mx-1 sm:mx-2 ${lineIsActive ? 'bg-secondary' : 'bg-gray-600'}`}></div>
              )}

              {/* Node Button */} 
              <button
                onClick={() => onNavigate(index)}
                className={`
                  w-5 h-5 sm:w-6 sm:h-6 rounded-full border transition-all duration-200 flex-shrink-0
                  flex items-center justify-center relative group
                  ${isCurrent 
                    ? 'border-secondary bg-secondary scale-110' 
                    : isCompleted 
                      ? 'border-secondary bg-black/10' 
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-400'
                  }
                `}
                aria-label={`Go to question ${index + 1}${isCompleted ? ' (Completed)' : ''}`}
              >
                {/* Checkmark or Number */} 
                {isCompleted && !isCurrent && (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
                )}
                {isCurrent && (
                  <span className="text-xs sm:text-sm font-bold text-black">
                    {index + 1}
                  </span>
                )}
                {!isCurrent && !isCompleted && (
                  <span className="text-[10px] sm:text-xs text-gray-400">{index + 1}</span>
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                   Question {index + 1}
                   {isCompleted && " (Done)"}
                   <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-4px] w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black/80" />
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default QuizNavBar; 