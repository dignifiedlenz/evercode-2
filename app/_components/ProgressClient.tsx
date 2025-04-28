'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserProgress, saveVideoProgress, saveQuestionProgress, saveUnitProgress, resetUserProgress } from '@/app/actions/progress';
import debounce from 'lodash.debounce'; // Make sure to install lodash: npm install lodash.debounce @types/lodash.debounce
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Types for progress data
export type VideoProgress = {
  userId: string;
  unitId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastUpdated?: Date;
};

export type QuestionProgress = {
  userId: string;
  questionId: string;
  unitId: string;
  attempts: number;
  correct: boolean;
  lastUpdated?: Date;
};

export type UnitProgress = {
  userId: string;
  unitId: string;
  videoCompleted: boolean;
  questionsCompleted: number;
  totalQuestions: number;
  lastUpdated?: Date;
};

export type UserProgress = {
  userId: string;
  videoProgress: VideoProgress[];
  questionProgress: QuestionProgress[];
  unitProgress: UnitProgress[];
};

// Progress context provider
export function useProgress() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Fetch user progress data
  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching progress...');
      const result = await getUserProgress();

      if (!result) {
        console.error('No progress data returned from server action');
        setError('Failed to load progress: No data');
        setProgress(null);
        return;
      }

      if ('error' in result) {
        console.error('Failed to load progress:', result.error);
        setError(result.error as string);
        setProgress(null);
        return;
      }

      console.log('Progress loaded successfully');
      setProgress(result as UserProgress);
    } catch (err) {
      console.error('Exception fetching progress:', err);
      setError('Failed to load progress data (exception)');
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Set up real-time subscriptions immediately
  useEffect(() => {
    // Get the current session
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.id;
    };

    const setupSubscriptions = async () => {
      const userId = await getCurrentUser();
      if (!userId) return;

      console.log('Setting up real-time subscriptions for user:', userId);

      // Subscribe to VideoProgress changes
      const videoSubscription = supabase
        .channel('video-progress-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'VideoProgress',
            filter: `userId=eq.${userId}`
          },
          async (payload) => {
            console.log('VideoProgress update received:', payload);
            // Optimistic update for video progress
            if (payload.new && 'unitId' in payload.new) {
              setProgress(prev => {
                if (!prev) return prev;
                const newProgress = payload.new as VideoProgress;
                const updatedVideoProgress = prev.videoProgress.map(vp =>
                  vp.unitId === newProgress.unitId ? { ...vp, ...newProgress } : vp
                );
                if (!updatedVideoProgress.some(vp => vp.unitId === newProgress.unitId)) {
                  updatedVideoProgress.push(newProgress);
                }
                return { ...prev, videoProgress: updatedVideoProgress };
              });
            }
          }
        )
        .subscribe();

      // Subscribe to UnitProgress changes
      const unitSubscription = supabase
        .channel('unit-progress-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'UnitProgress',
            filter: `userId=eq.${userId}`
          },
          async (payload) => {
            console.log('UnitProgress update received:', payload);
            // Optimistic update for unit progress
            if (payload.new && 'unitId' in payload.new) {
              setProgress(prev => {
                if (!prev) return prev;
                const newProgress = payload.new as UnitProgress;
                const updatedUnitProgress = prev.unitProgress.map(up =>
                  up.unitId === newProgress.unitId ? { ...up, ...newProgress } : up
                );
                if (!updatedUnitProgress.some(up => up.unitId === newProgress.unitId)) {
                  updatedUnitProgress.push(newProgress);
                }
                return { ...prev, unitProgress: updatedUnitProgress };
              });
            }
          }
        )
        .subscribe();

      return () => {
        console.log('Cleaning up real-time subscriptions');
        videoSubscription.unsubscribe();
        unitSubscription.unsubscribe();
      };
    };

    const cleanup = setupSubscriptions();
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [supabase]);

  // Debounced function for saving video progress
  const debouncedSaveVideoProgress = useCallback(
    debounce(async (data: Parameters<typeof saveVideoProgress>[0]) => {
      try {
        console.log('[ProgressClient] Debounced function executing! Calling saveVideoProgress server action with:', data);
        const result = await saveVideoProgress(data);
        if (!result || 'error' in result) {
          console.error('[ProgressClient] Failed to save video progress via server action:', result?.error || 'Unknown error');
          // Optionally set an error state or retry mechanism
        } else {
          console.log('[ProgressClient] Server action saveVideoProgress successful.');
        }
        // No local state update here, rely on next full fetch or optimistic update below
      } catch (err) {
        console.error('[ProgressClient] Exception in debouncedSaveVideoProgress wrapper:', err);
      }
    }, 5000), // Debounce for 5000ms (5 seconds)
    [] // useCallback dependency array
  );

  // Track video progress (optimistic update + debounced save)
  const trackVideoProgress = useCallback(
    async (data: {
      unitId: string;
      currentTime: number;
      duration: number;
      completed: boolean;
    }) => {
      console.log('Track video progress called:', data);
      // Optimistic UI update
      setProgress(currentProgress => {
        if (!currentProgress) return null;

        const updatedVideoProgress = [...currentProgress.videoProgress];
        const existingIndex = updatedVideoProgress.findIndex(vp => vp.unitId === data.unitId);

        const newEntry: VideoProgress = {
          ...data,
          userId: currentProgress.userId,
          lastUpdated: new Date(),
        };

        if (existingIndex >= 0) {
          updatedVideoProgress[existingIndex] = newEntry;
        } else {
          updatedVideoProgress.push(newEntry);
        }

        return {
          ...currentProgress,
          videoProgress: updatedVideoProgress,
        };
      });

      // Call the debounced function to save to the backend
      debouncedSaveVideoProgress(data);

      // Indicate immediate success for the optimistic update
      return true;
    },
    [debouncedSaveVideoProgress] // Dependency: the debounced function itself
  );

  // Track question progress (no debounce needed usually)
  const trackQuestionProgress = useCallback(
    async (data: {
      questionId: string;
      unitId: string;
      correct: boolean;
    }) => {
      const { questionId, unitId, correct } = data;
      try {
        console.log('Track question progress called:', { questionId, unitId, correct });
        
        // Optimistic update
        setProgress(currentProgress => {
          if (!currentProgress) return null;

          const updatedQuestionProgress = [...currentProgress.questionProgress];
          const existingIndex = updatedQuestionProgress.findIndex(qp => qp.questionId === questionId);

          if (existingIndex >= 0) {
            const existing = updatedQuestionProgress[existingIndex];
            updatedQuestionProgress[existingIndex] = {
              ...existing,
              correct,
              attempts: existing.attempts + 1,
              lastUpdated: new Date()
            };
          } else {
            updatedQuestionProgress.push({
              userId: currentProgress.userId,
              questionId,
              unitId,
              attempts: 1,
              correct,
              lastUpdated: new Date()
            });
          }

          return {
            ...currentProgress,
            questionProgress: updatedQuestionProgress
          };
        });

        // Call the server action
        const result = await saveQuestionProgress({
          questionId,
          unitId,
          correct
        });
        
        if (!result || 'error' in result) {
          console.error('Failed to save question progress:', result?.error);
          fetchProgress(); // Re-fetch to sync state if save failed
          return false;
        }
        return true;
      } catch (err) {
        console.error('Error in trackQuestionProgress:', err);
        fetchProgress(); // Re-fetch on error
        return false;
      }
    },
    [fetchProgress]
  );

  // Track unit progress (no debounce needed usually)
  const trackUnitProgress = useCallback(async (data: {
    unitId: string;
    videoCompleted?: boolean;
    questionsCompleted?: number;
    totalQuestions?: number;
  }) => {
     console.log('Track unit progress called:', data);
    try {
      // Optimistic update
      setProgress(currentProgress => {
        if (!currentProgress) return null;

        const updatedUnitProgress = [...currentProgress.unitProgress];
        const existingIndex = updatedUnitProgress.findIndex(up => up.unitId === data.unitId);

        if (existingIndex >= 0) {
          const existing = updatedUnitProgress[existingIndex];
          updatedUnitProgress[existingIndex] = {
            ...existing,
            videoCompleted: data.videoCompleted !== undefined ? data.videoCompleted : existing.videoCompleted,
            questionsCompleted: data.questionsCompleted !== undefined ? data.questionsCompleted : existing.questionsCompleted,
            totalQuestions: data.totalQuestions || 5, // Use provided value or default to 5
            lastUpdated: new Date()
          };
        } else {
          updatedUnitProgress.push({
            userId: currentProgress.userId,
            unitId: data.unitId,
            videoCompleted: data.videoCompleted || false,
            questionsCompleted: data.questionsCompleted || 0,
            totalQuestions: data.totalQuestions || 5, // Use provided value or default to 5
            lastUpdated: new Date()
          });
        }
        return {
          ...currentProgress,
          unitProgress: updatedUnitProgress
        };
      });

      // Call the server action
      const result = await saveUnitProgress(data);
       if (!result || 'error' in result) {
        console.error('Failed to save unit progress:', result?.error || 'Unknown error');
        fetchProgress(); // Re-fetch to sync state if save failed
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception saving unit progress:', err);
      fetchProgress(); // Re-fetch on exception
      return false;
    }
  }, [fetchProgress]);

  // Reset all progress
  const resetProgress = useCallback(async () => {
     console.log('Reset progress called');
    try {
       // Optimistic update
      setProgress(currentProgress => {
        if (!currentProgress) return null;
        return {
          ...currentProgress,
          videoProgress: [],
          questionProgress: [],
          unitProgress: []
        };
      });

      // Call server action
      const result = await resetUserProgress();
       if (!result || 'error' in result) {
        console.error('Failed to reset progress:', result?.error || 'Unknown error');
        fetchProgress(); // Re-fetch if reset failed
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception resetting progress:', err);
      fetchProgress(); // Re-fetch on exception
      return false;
    }
  }, [fetchProgress]);

  // Load progress on mount
  useEffect(() => {
    fetchProgress();
    // Cleanup debounce on unmount
    return () => {
      debouncedSaveVideoProgress.cancel();
    };
  }, [fetchProgress, debouncedSaveVideoProgress]); // Add debounced function to dependencies

  return {
    loading,
    progress,
    error,
    refreshProgress: fetchProgress,
    trackVideoProgress,
    trackQuestionProgress,
    trackUnitProgress,
    resetProgress
  };
}

// Usage example component
export default function ProgressClient() {
  const { 
    loading, 
    progress, 
    error, 
    trackVideoProgress, 
    trackQuestionProgress, 
    trackUnitProgress, 
    resetProgress 
  } = useProgress();
  
  if (loading) return <div>Loading progress data...</div>;
  if (error) return <div>Error loading progress: {error}</div>;
  if (!progress) return <div>No progress data available.</div>; // Handle null state
  
  // Example handlers for demonstration purposes
  const handleVideoUpdate = async () => {
    const result = await trackVideoProgress({
      unitId: 'unit-1',
      currentTime: Math.random() * 100, // Simulate time change
      duration: 120,
      completed: Math.random() > 0.8 // Simulate completion change
    });
    
    // Note: result is now always true due to optimistic update
    console.log('Video progress tracking initiated (debounced save pending)');
  };
  
  const handleQuestionUpdate = async () => {
    await trackQuestionProgress({
      questionId: 'q' + Math.floor(Math.random() * 10 + 1), // Simulate question change
      unitId: 'unit-1',
      correct: Math.random() > 0.5
    });
  };
  
  const handleUnitUpdate = async () => {
    const result = await trackUnitProgress({
      unitId: 'unit-1',
      videoCompleted: Math.random() > 0.5,
      questionsCompleted: Math.floor(Math.random() * 6)
    });
    
    if (result) {
      console.log('Unit progress update successful (or optimistic)');
    } else {
      console.log('Unit progress update failed');
    }
  };
  
  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      const result = await resetProgress();
      if (result) {
        console.log('Progress reset successful (or optimistic)');
      } else {
         console.log('Progress reset failed');
      }
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Progress Client</h2>
      <div className="space-y-4">
        <button
          onClick={handleVideoUpdate}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Simulate Video Progress
        </button>
        <button
          onClick={handleQuestionUpdate}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Simulate Question Progress
        </button>
        <button
          onClick={handleUnitUpdate}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Simulate Unit Progress
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Reset Progress
        </button>
      </div>
      {progress && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Current Progress</h3>
          <div className="space-y-2">
            <p>User ID: {progress.userId}</p>
            <div>
              <h4 className="font-medium">Video Progress:</h4>
              <ul className="list-disc pl-4">
                {progress.videoProgress.map((vp) => (
                  <li key={vp.unitId}>
                    Unit {vp.unitId}: {vp.completed ? 'Completed' : 'In Progress'} ({vp.currentTime}/{vp.duration}s)
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Question Progress:</h4>
              <ul className="list-disc pl-4">
                {progress.questionProgress.map((qp) => (
                  <li key={qp.questionId}>
                    Question {qp.questionId}: {qp.correct ? 'Correct' : 'Incorrect'}, Attempts: {qp.attempts}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Unit Progress:</h4>
              <ul className="list-disc pl-4">
                {progress.unitProgress.map((up) => (
                  <li key={up.unitId}>
                    Unit {up.unitId}: Video {up.videoCompleted ? 'Completed' : 'In Progress'}, Questions {up.questionsCompleted}/{up.totalQuestions}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 