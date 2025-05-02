'use server';

import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import courseData from '@/app/_components/(semester1)/courseData';

// Centralized error messages
const AUTH_ERROR = 'Authentication required.';
const DB_FETCH_ERROR = 'Failed to fetch progress.';
const DB_SAVE_ERROR = 'Failed to save progress.';
const DB_RESET_ERROR = 'Failed to reset progress.';
const UNKNOWN_ERROR = 'An unknown error occurred.';

// Get the authenticated Supabase user ID
async function getAuthenticatedSupabaseUserId() {
  try {
    const supabase = createServerActionClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Supabase session error in Server Action:', sessionError.message);
      return { error: AUTH_ERROR };
    }
    if (!session?.user?.id) {
      console.log('No active session or user ID found in Server Action.');
      return { error: AUTH_ERROR };
    }
    // Return the Supabase Auth User ID
    return { userId: session.user.id };
  } catch (error) {
    console.error('Unexpected error in getAuthenticatedSupabaseUserId:', error);
    return { error: UNKNOWN_ERROR };
  }
}

// Get user progress from Supabase tables
export async function getUserProgress() {
  console.log('Server Action: Getting user progress (Supabase)');
  const authResult = await getAuthenticatedSupabaseUserId();
  if ('error' in authResult) {
    return { error: authResult.error };
  }
  const { userId: authId } = authResult;
  const supabase = createServerActionClient({ cookies });

  try {
    // Fetch progress from all relevant tables in parallel
    const [videoRes, questionRes, unitRes] = await Promise.all([
      supabase.from('VideoProgress').select('*').eq('userId', authId),
      supabase.from('QuestionProgress').select('*').eq('userId', authId),
      supabase.from('UnitProgress').select('*').eq('userId', authId)
    ]);

    // Basic error check (could be more granular)
    if (videoRes.error || questionRes.error || unitRes.error) {
      console.error('Error fetching progress parts:', {
        videoError: videoRes.error?.message,
        questionError: questionRes.error?.message,
        unitError: unitRes.error?.message
      });
    }

    const progressData = {
      userId: authId,
      videoProgress: videoRes.data || [],
      questionProgress: questionRes.data || [],
      unitProgress: unitRes.data || []
    };

    console.log(`Progress fetched successfully for user ${authId} (Supabase)`);
    return progressData;
  } catch (error) {
    console.error('Error fetching progress from Supabase DB:', error);
    return { error: DB_FETCH_ERROR };
  }
}

// Save video progress to Supabase
export async function saveVideoProgress(data: {
  unitId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
}) {
  console.log('[saveVideoProgress Action] Received request:', data);
  const authResult = await getAuthenticatedSupabaseUserId();
  if ('error' in authResult) {
    console.error('[saveVideoProgress Action] Authentication error:', authResult.error);
    return { error: authResult.error };
  }
  const { userId: authId } = authResult;
  const supabase = createServerActionClient({ cookies });

  try {
    const upsertData = {
      userId: authId, // Use auth_id directly
      unitId: data.unitId,
      currentTime: data.currentTime,
      duration: data.duration,
      completed: data.completed,
      lastUpdated: new Date().toISOString(),
    };

    console.log('[saveVideoProgress Action] Attempting upsert with data:', upsertData);

    const { error } = await supabase
      .from('VideoProgress')
      .upsert(upsertData, {
        onConflict: 'userId, unitId'
      });

    if (error) {
      console.error(`[saveVideoProgress Action] Supabase upsert error:`, error);
      throw error;
    }

    console.log(`[saveVideoProgress Action] Upsert successful for user ${authId}, unit ${data.unitId}`);
    return { success: true };
  } catch (error) {
    console.error(`[saveVideoProgress Action] Catch block error:`, error);
    return { error: DB_SAVE_ERROR };
  }
}

// Save question progress to Supabase
export async function saveQuestionProgress({
  questionId,
  unitId,
  correct
}: {
  questionId: string;
  unitId: string;
  correct: boolean;
}) {
  console.log('Server Action: Saving question progress (Supabase) for question:', questionId);
  const authResult = await getAuthenticatedSupabaseUserId();
  if ('error' in authResult) return { error: authResult.error };
  const { userId: authId } = authResult; // authId is uuid
  const supabase = createServerActionClient({ cookies });

  try {
    // ---- CHECK USER EXISTS IN PUBLIC.USER TABLE ----
    const { data: userCheck, error: userCheckError } = await supabase
        .from('User') // Your public User table
        .select('auth_id') // Select the column the FK likely references
        .eq('auth_id', authId) // Check using the authId
        .maybeSingle(); // Expect 0 or 1 result

    if (userCheckError) {
        console.error(`Error checking user existence (authId: ${authId}):`, userCheckError);
        return { error: 'Failed to verify user existence before saving progress.' };
    }
    if (!userCheck) {
        console.error(`User with auth_id ${authId} not found in public.User table. Cannot save progress.`);
        // This indicates a potential data sync issue between auth.users and public.User
        return { error: 'User record not found. Progress cannot be saved.' };
    }
    console.log(`User ${authId} verified in public.User table.`);
    // ---- END USER CHECK ----

    // Call the RPC function - parameter names MUST match the function definition
    const { error: rpcError } = await supabase.rpc('increment_question_attempt', {
        p_auth_id: authId,          // Function expects uuid
        p_question_id: questionId, // Function expects text (matching questionId column)
        p_unit_id: unitId,     // Function expects text (matching unitId column)
        p_correct: correct
    });

    // Rename error variable to avoid conflict
    if (rpcError) {
        console.error('RPC increment_question_attempt failed:', rpcError);
        throw rpcError; // Re-throw to be caught below
    }
    console.log(`Question progress saved successfully for user ${authId}, question ${questionId} (Supabase)`);
    return { success: true };
  } catch (error) {
    // Log the caught error (could be from user check or RPC)
    console.error('Error saving question progress to Supabase DB:', error);
    return { error: DB_SAVE_ERROR }; // Return generic error
  }
}

// Helper function to find total questions for a unit
function getTotalQuestionsForUnit(unitId: string): number {
  for (const semester of courseData) {
    for (const chapter of semester.chapters) {
      const unit = chapter.units.find(u => u.id === unitId);
      if (unit?.video?.questions) {
        return unit.video.questions.length;
      }
    }
  }
  console.warn(`Could not find unit or questions for unitId: ${unitId}. Defaulting totalQuestions to 0.`);
  return 0;
}

// Save unit progress to Supabase
export async function saveUnitProgress(data: {
  unitId: string;
  videoCompleted?: boolean;
  questionsCompleted?: number;
}) {
  console.log('Server Action: Saving unit progress (Supabase) for unit:', data.unitId);
  const authResult = await getAuthenticatedSupabaseUserId();
  if ('error' in authResult) {
    return { error: authResult.error };
  }
  const { userId: authId } = authResult;
  const supabase = createServerActionClient({ cookies });

  let updateData: Partial<{
      userId: string;
      unitId: string;
      videoCompleted: boolean;
      questionsCompleted: number;
      lastUpdated: string;
  }> = {
      userId: authId,
      unitId: data.unitId,
      lastUpdated: new Date().toISOString()
  };

  if (typeof data.videoCompleted === 'boolean') {
      updateData.videoCompleted = data.videoCompleted;
  }

  if (typeof data.questionsCompleted === 'number') {
      updateData.questionsCompleted = data.questionsCompleted;
  }

  try {
    const { error } = await supabase
      .from('UnitProgress')
      .upsert(updateData, {
        onConflict: 'userId, unitId'
      });

    if (error) {
      console.error('Error saving unit progress:', error);
      throw error;
    }

    console.log(`Unit progress saved successfully for user ${authId}, unit ${data.unitId}`);
    return { success: true };
  } catch (error) {
    console.error('Error saving unit progress to Supabase DB:', error);
    return { error: DB_SAVE_ERROR };
  }
}

// Reset user progress in Supabase
export async function resetUserProgress() {
  console.log('Server Action: Resetting user progress (Supabase)');
  const authResult = await getAuthenticatedSupabaseUserId();
  if ('error' in authResult) {
    return { error: authResult.error };
  }
  const { userId: authId } = authResult;
  const supabase = createServerActionClient({ cookies });

  try {
    // Delete records from all progress tables for the user
    const [videoRes, questionRes, unitRes] = await Promise.all([
      supabase.from('VideoProgress').delete().eq('userId', authId),
      supabase.from('QuestionProgress').delete().eq('userId', authId),
      supabase.from('UnitProgress').delete().eq('userId', authId)
    ]);

    // Check for errors during deletion
    if (videoRes.error || questionRes.error || unitRes.error) {
        console.error('Error resetting progress parts:', {
            videoError: videoRes.error?.message,
            questionError: questionRes.error?.message,
            unitError: unitRes.error?.message
        });
      // If one fails, the reset is incomplete
      throw new Error('Partial reset failure'); 
    }

    console.log(`Progress reset successfully for user ${authId} (Supabase)`);
    return { success: true };
  } catch (error) {
    console.error('Error resetting progress in Supabase DB:', error);
    return { error: DB_RESET_ERROR };
  }
}

export interface QuestionProgress {
  questionId: string;
  unitId: string;
  correct: boolean;
  selectedAnswer: string;
}

export async function trackQuestionProgress({
  questionId,
  unitId,
  correct
}: {
  questionId: string;
  unitId: string;
  correct: boolean;
}) {
  return saveQuestionProgress({
    questionId,
    unitId,
    correct
  });
} 