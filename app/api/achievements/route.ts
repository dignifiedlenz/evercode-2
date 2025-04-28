import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Achievement } from '@/app/actions/achievements';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: achievements, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }

  return NextResponse.json(achievements);
}

export async function POST(request: Request) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { progress } = await request.json();

  // Get all possible achievements
  const { data: allAchievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*');

  if (achievementsError) {
    console.error('Error fetching achievements:', achievementsError);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }

  // Get user's current achievements
  const { data: userAchievements, error: userError } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', user.id);

  if (userError) {
    console.error('Error fetching user achievements:', userError);
    return NextResponse.json({ error: 'Failed to fetch user achievements' }, { status: 500 });
  }

  const unlockedAchievements: Achievement[] = [];

  // Check each achievement
  for (const achievement of allAchievements) {
    const hasAchievement = userAchievements.some(
      (ua: { achievement_id: string }) => ua.achievement_id === achievement.id
    );

    if (!hasAchievement) {
      let shouldUnlock = false;
      let progressValue = 0;

      switch (achievement.type) {
        case 'units':
          progressValue = progress.completedUnits;
          shouldUnlock = progress.completedUnits >= achievement.threshold;
          break;
        case 'quizzes':
          progressValue = progress.completedQuizzes;
          shouldUnlock = progress.completedQuizzes >= achievement.threshold;
          break;
        case 'chapters':
          progressValue = progress.completedChapters;
          shouldUnlock = progress.completedChapters >= achievement.threshold;
          break;
      }

      if (shouldUnlock) {
        // Insert new achievement
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
            progress: progressValue,
            unlocked_at: new Date().toISOString(),
          });

        if (!insertError) {
          unlockedAchievements.push(achievement);
        }
      }
    }
  }

  return NextResponse.json(unlockedAchievements);
} 