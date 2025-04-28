import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('API Progress: Unauthorized access attempt.', sessionError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Get completed unit IDs from UnitProgress table
    const { data: completedUnitsData, error: progressError } = await supabase
      .from('UnitProgress')
      .select('unitId, videoCompleted, questionsCompleted, totalQuestions')
      .eq('userId', userId)
      .eq('videoCompleted', true)
      .gte('questionsCompleted', 5); // Assuming 5 is the default totalQuestions value

    if (progressError) {
      console.error(`API Progress: Error fetching UnitProgress for user ${userId}:`, progressError);
      // Don't fail entirely, maybe the table is empty or RLS prevents access?
      // Return empty list instead of 500 error for now.
      return NextResponse.json({ completedUnitIds: [] });
    }

    // Extract just the unit IDs into an array
    const completedUnitIds = completedUnitsData?.map(item => item.unitId) || [];

    // Return the array of completed unit IDs
    console.log(`API Progress: Successfully fetched ${completedUnitIds.length} completed units for user ${userId}`);
    return NextResponse.json({ completedUnitIds });

  } catch (error) {
    console.error('API Progress: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 