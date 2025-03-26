import axios from 'axios';

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
  questionsCompleted: boolean;
  completed: boolean;
  lastAccessed: Date;
}

/**
 * Save video progress to the database
 */
export async function saveVideoProgress(
  unitId: string,
  chapterId: string,
  videoId: string,
  currentTime: number,
  duration: number
): Promise<void> {
  if (!unitId || !chapterId || !videoId) {
    console.error("Missing required parameters for video progress");
    return;
  }

  try {
    const payload = {
      type: 'video',
      data: {
        videoId,
        unitId,
        chapterId,
        currentTime,
        duration,
        completed: currentTime >= duration * 0.9 // Mark as complete if watched 90%
      }
    };
    
    await axios.post('/api/progress', payload);
    
    // Notify that progress has been updated
    notifyProgressUpdate();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to save video progress:", error.response?.data || error.message);
    } else {
      console.error("Failed to save video progress:", error);
    }
  }
}

/**
 * Save question progress to the database
 */
export async function saveQuestionProgress(
  unitId: string,
  chapterId: string,
  questionId: string,
  correct: boolean
): Promise<void> {
  if (!unitId || !chapterId || !questionId) {
    console.error("Missing required parameters for question progress");
    return;
  }

  try {
    const payload = {
      type: 'question',
      data: {
        questionId,
        unitId,
        chapterId,
        answered: true,
        correct
      }
    };
    
    await axios.post('/api/progress', payload);
    
    // Notify that progress has been updated
    notifyProgressUpdate();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to save question progress:", error.response?.data || error.message);
    } else {
      console.error("Failed to save question progress:", error);
    }
  }
}

/**
 * Update unit progress
 */
export async function saveUnitProgress(
  unitId: string,
  chapterId: string,
  videoCompleted?: boolean,
  questionsCompleted?: boolean
): Promise<void> {
  if (!unitId || !chapterId) {
    console.error("Missing required parameters for unit progress");
    return;
  }

  try {
    // Get current user data from the session
    const userResponse = await axios.get('/api/auth/session');
    const user = userResponse.data?.user;

    const payload = {
      type: 'unit',
      data: {
        unitId,
        chapterId,
        firstName: user?.firstName,
        lastName: user?.lastName,
        ...(videoCompleted !== undefined && { videoCompleted }),
        ...(questionsCompleted !== undefined && { questionsCompleted })
      }
    };
    
    await axios.post('/api/progress', payload);
    
    // Notify that progress has been updated
    notifyProgressUpdate();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to save unit progress:", error.response?.data || error.message);
    } else {
      console.error("Failed to save unit progress:", error);
    }
  }
}

/**
 * Get user progress from the database
 */
export async function getUserProgress(): Promise<UserProgress | null> {
  try {
    const response = await axios.get('/api/progress');
    return response.data.progress;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to get user progress:", error.response?.data || error.message);
    } else {
      console.error("Failed to get user progress:", error);
    }
    return null;
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
    (up: UnitProgress) => up.unitId === unitId
  );
  
  return unitProgress ? unitProgress.completed : false;
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
    (vp: VideoProgress) => vp.unitId === unitId && vp.videoId === videoId
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
    (qp: QuestionProgress) => qp.unitId === unitId && qp.chapterId === chapterId
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
    for (const questionId of questionIds) {
      await saveQuestionProgress(unitId, chapterId, questionId, true);
    }
    
    await saveUnitProgress(unitId, chapterId, undefined, true);
  } catch (error) {
    console.error("Failed to mark all questions as completed:", error);
  }
}

/**
 * Reset all user progress
 */
export async function resetUserProgress(): Promise<{success: boolean, details?: any}> {
  try {
    console.log("Calling reset progress API");
    const response = await axios.delete('/api/progress/reset');
    
    if (response.data.success) {
      // Log detailed information about what was reset
      console.log("Progress reset successful with details:", response.data.details);
      
      // Notify that progress has been updated
      notifyProgressUpdate();
      
      return {
        success: true,
        details: response.data.details
      };
    }
    
    console.error("Reset progress failed:", response.data);
    return {
      success: false,
      details: response.data
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to reset user progress:", error.response?.data || error.message);
      return {
        success: false,
        details: error.response?.data || error.message
      };
    } else {
      console.error("Failed to reset user progress:", error);
      return {
        success: false,
        details: String(error)
      };
    }
  }
} 