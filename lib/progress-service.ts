import axios from 'axios';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Custom event name for progress updates
const PROGRESS_UPDATED_EVENT = 'progress-updated';

// Helper function to dispatch progress update event
const notifyProgressUpdate = () => {
  if (typeof window !== 'undefined') {
    console.log("Progress service: Dispatching progress update event");
    window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
  }
};

// Interface for progress data
export interface UserProgress {
  id: string;
  userId: string;
  videoProgress?: VideoProgress[];
  questionProgress?: QuestionProgress[];
  unitProgress?: UnitProgress[];
}

export interface VideoProgress {
  id: string;
  progressId: string;
  videoId: string;
  unitId: string;
  chapterId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastUpdated: Date;
}

export interface QuestionProgress {
  id: string;
  progressId: string;
  questionId: string;
  unitId: string;
  chapterId: string;
  answered: boolean;
  correct: boolean;
  lastUpdated: Date;
}

export interface UnitProgress {
  id: string;
  progressId: string;
  unitId: string;
  chapterId: string;
  videoCompleted: boolean;
  questionsCompleted: number;
  totalQuestions: number;
  completed: boolean;
  lastAccessed: Date;
}

// Types
interface VideoProgressData {
  unitId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
}

interface QuestionProgressData {
  questionId: string;
  unitId: string;
  correct: boolean;
}

interface UnitProgressData {
  unitId: string;
  videoCompleted: boolean;
  questionsCompleted: number;
}

/**
 * Save video progress to the database via API
 */
export async function saveVideoProgress(data: VideoProgressData) {
  try {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'video',
        data
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save video progress');
    }
    
    notifyProgressUpdate();
    return await response.json();
  } catch (error) {
    console.error('Error saving video progress:', error);
    throw error;
  }
}

/**
 * Save question progress to the database via API
 */
export async function saveQuestionProgress(data: QuestionProgressData) {
  try {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'question',
        data
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save question progress');
    }
    
    notifyProgressUpdate();
    return await response.json();
  } catch (error) {
    console.error('Error saving question progress:', error);
    throw error;
  }
}

/**
 * Update unit progress via API
 */
export async function saveUnitProgress(data: UnitProgressData) {
  try {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'unit',
        data
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save unit progress');
    }
    
    notifyProgressUpdate();
    return await response.json();
  } catch (error) {
    console.error('Error saving unit progress:', error);
    throw error;
  }
}

/**
 * Get user progress from the API
 */
export async function getUserProgress() {
  try {
    const response = await fetch('/api/progress', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
}

/**
 * Reset user progress via API
 */
export async function resetUserProgress() {
  try {
    const response = await fetch('/api/progress', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset progress');
    }
    
    notifyProgressUpdate();
    return await response.json();
  } catch (error) {
    console.error('Error resetting progress:', error);
    throw error;
  }
}

/**
 * Check if a unit is complete
 */
export function isUnitComplete(
  userProgress: UserProgress | null,
  unitId: string
): boolean {
  if (!userProgress || !userProgress.unitProgress) return false;
  
  const unitProgress = userProgress.unitProgress.find(
    (up) => up.unitId === unitId
  );
  
  // A unit is complete if both video is completed and questions are completed
  if (!unitProgress) return false;
  
  // Consider a unit complete if video is done and all questions are answered
  const videoComplete = unitProgress.videoCompleted === true;
  
  // If the unit has totalQuestions defined, use that value for comparison
  const totalQuestions = unitProgress.totalQuestions || 5;
  const quizComplete = unitProgress.questionsCompleted >= totalQuestions;
  
  return videoComplete && quizComplete;
}

/**
 * Get video progress for a specific video
 */
export function getVideoProgress(
  userProgress: UserProgress | null,
  unitId: string,
  videoId: string
): number {
  if (!userProgress || !userProgress.videoProgress) return 0;
  
  const videoProgress = userProgress.videoProgress.find(
    (vp) => vp.unitId === unitId && vp.videoId === videoId
  );
  
  return videoProgress ? videoProgress.currentTime : 0;
}

/**
 * Get question progress for a unit
 */
export function getQuestionProgress(
  userProgress: UserProgress | null,
  unitId: string,
  chapterId: string
): QuestionProgress[] {
  if (!userProgress || !userProgress.questionProgress) return [];
  
  return userProgress.questionProgress.filter(
    (qp) => qp.unitId === unitId && qp.chapterId === chapterId
  );
}

/**
 * Mark all questions as completed for a unit
 */
export async function markAllQuestionsCompleted(
  unitId: string,
  chapterId: string,
  questionIds: string[]
): Promise<void> {
  try {
    const payload = {
      type: 'questions',
      data: {
        unitId,
        chapterId,
        questionIds,
        completed: true
      }
    };
    
    // Make API request to mark questions as completed
    await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    notifyProgressUpdate();
  } catch (error) {
    console.error('Error marking questions as completed:', error);
    throw error;
  }
}

/**
 * Calculate overall course progress
 */
export function calculateOverallProgress(userProgress: UserProgress | null): number {
  if (!userProgress || !userProgress.unitProgress) return 0;
  
  const totalUnits = userProgress.unitProgress.length;
  if (totalUnits === 0) return 0;
  
  const completedUnits = userProgress.unitProgress.filter(up => !!up.completed).length;
  return (completedUnits / totalUnits) * 100;
} 