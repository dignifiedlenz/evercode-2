import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import UserMenu from '@/app/_components/UserMenu';
import LogoSection from '@/app/_components/LogoSection';
import courseData from "@/app/_components/(semester1)/courseData";
import Sidebar from '@/app/_components/sidebar';

interface LayoutProps {
  children: React.ReactNode;
  params: { semesterId: string };
}

export default async function SemesterLayout({ children, params: paramsProp }: LayoutProps) {
  const params = await paramsProp;
  let user = null;
  let dbUser = null;
  let initialCompletedUnits: Record<string, boolean> = {};

  try {
    console.log('[Server Layout] Rendering with params:', params);

    const cookiesInstance = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookiesInstance });

    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
    console.log('[Server Layout] Auth check result:', { hasUser: !!authUser, userId: authUser?.id });

    if (userError || !authUser) {
      console.error('[Server Layout] Auth error or no user:', userError?.message || 'No user');
      redirect('/auth/signin');
    }
    
    user = authUser;

    console.log('[Server Layout] Checking user in DB...');
    const { data: foundDbUser, error: dbError } = await supabase
      .from('User')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('[Server Layout] Error fetching user from DB:', dbError.message);
      redirect('/auth/signin?error=database_error');
    }

    if (!foundDbUser) {
      console.log('[Server Layout] User not found in DB, creating...');
      const { data: createdUser, error: createError } = await supabase.from('User').insert({
         auth_id: user.id,
         email: user.email,
         role: 'USER',
         firstName: user.user_metadata?.firstName || '',
         lastName: user.user_metadata?.lastName || ''
      }).select().single();

      if (createError) {
         console.error('[Server Layout] Error creating user:', createError.message);
         redirect('/auth/signin?error=user_creation_failed');
      }
      console.log('[Server Layout] User created in DB:', createdUser);
      dbUser = createdUser;
    } else {
      console.log('[Server Layout] User found in DB:', foundDbUser);
      dbUser = foundDbUser;
    }

    console.log('[Server Layout] Fetching initial progress...');
    const { data: progressData, error: progressError } = await supabase
        .from('UnitProgress')
        .select('unitId, videoCompleted, questionsCompleted, totalQuestions')
        .eq('userId', user.id);

    if (progressError) {
        console.error('[Server Layout] Error fetching progress:', progressError.message);
        initialCompletedUnits = {};
    } else if (progressData) {
        initialCompletedUnits = progressData.reduce((acc, unit) => {
            const isComplete = unit.videoCompleted && unit.questionsCompleted >= unit.totalQuestions;
            acc[unit.unitId] = isComplete;
            return acc;
        }, {} as Record<string, boolean>);
        console.log(`[Server Layout] Initial progress fetched. ${Object.keys(initialCompletedUnits).length} units processed.`);
    }

  } catch (error) {
     console.error('[Server Layout] Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
     redirect('/auth/signin?error=unexpected_error');
  }

  const semesterId = params.semesterId;
  const currentSemester = semesterId ? parseInt(semesterId.replace('semester-', ''), 10) : 1;
  const semester = courseData.find(sem => sem.id === `semester-${currentSemester}`);
  const backgroundImage = semester?.backgroundImage || '/540598ldsdl.jpg';

  return (
    <div className="relative min-h-screen w-full bg-black/75">
      <div 
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }}
      />
      <div 
        className="fixed inset-0 w-full h-full"
        style={{
          background: `radial-gradient(circle at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.95) 100%)`,
          zIndex: 2
        }}
      />

      <div className="relative z-10">
        <LogoSection semesterId={semesterId} />
        <UserMenu />
        <Sidebar 
          courseData={courseData}
          currentSemester={currentSemester}
          completedUnits={initialCompletedUnits}
        />
        <main className="relative min-h-screen w-full">{children}</main>
      </div>
    </div>
  );
} 