// REMOVED "use client"; This is now a Server Component

import { cookies } from 'next/headers'; // For server client
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import UserMenu from '@/app/_components/UserMenu'; // Use absolute paths
import LogoSection from '@/app/_components/LogoSection';
import courseData from "@/app/_components/(semester1)/courseData";
import Sidebar from '@/app/_components/sidebar';

// Helper function defined locally
function safeStringifyError(error: any): string {
  try {
    return JSON.stringify({
      message: error?.message || 'No message',
      name: error?.name || 'Unknown error',
      code: error?.code || 'No code',
      details: error?.details || 'No details',
      hint: error?.hint || 'No hint',
      stack: error?.stack || 'No stack trace'
    }, null, 2);
  } catch (e) {
    return `Error stringifying error: ${e}`;
  }
}

interface LayoutProps {
  children: React.ReactNode;
  params: { semesterId: string }; // <-- Expect resolved params
}

export default async function SemesterLayout({ children, params }: LayoutProps) {
  // --- Authentication and Data Fetching (Moved from outer layout) --- 
  try {
    console.log('Rendering [semesterId] layout with params:', params);

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Auth check
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('[semesterId] Layout User check:', { hasUser: !!user, userId: user?.id });
    if (userError || !user) {
      console.error('[semesterId] Layout Auth error/no user:', userError ? safeStringifyError(userError) : 'No user');
      redirect('/auth/signin');
    }

    // Check user in DB / Create if not exists (Optional, but kept from previous logic)
    const { data: dbUser, error: dbError } = await supabase
      .from('User')
      .select('*')
      .eq('auth_id', user.id)
      .single();
    if (dbError && dbError.code !== 'PGRST116') {
      console.error('[semesterId] Layout DB error:', safeStringifyError(dbError));
      redirect('/auth/signin');
    }
    if (!dbUser) {
      console.log('[semesterId] Layout: User not found in DB, creating...');
      const { error: createError } = await supabase.from('User').insert(/* ... user data ... */{
         auth_id: user.id,
         email: user.email, 
         role: 'STUDENT',
         firstName: user.user_metadata?.firstName || '', 
         lastName: user.user_metadata?.lastName || ''
      });
      if (createError) {
        console.error('[semesterId] Layout: Error creating user:', safeStringifyError(createError));
        redirect('/auth/signin');
      }
    }
    
    // Get currentSemester from resolved params
    const semesterId = params.semesterId; // Use directly
    const currentSemester = semesterId ? parseInt(semesterId.replace('semester-', ''), 10) : 1;

    // Fetch Progress (moved here)
    const { data: progressData, error: progressError } = await supabase
        .from('UnitProgress')
        .select('unitId, videoCompleted, questionsCompleted, totalQuestions')
        .eq('userId', user.id)
        // Add your completion logic filters here if needed
        // .eq('videoCompleted', true)
        // .gte('questionsCompleted', 5); 

    if (progressError) {
        console.error('[semesterId] Layout: Error fetching progress:', progressError);
    }
    const completedUnits = progressData?.reduce((acc, unit) => {
        // Define completion logic
        if (unit.videoCompleted && unit.questionsCompleted >= (unit.totalQuestions || 5)) {
           acc[unit.unitId] = true;
        }
        return acc;
    }, {} as Record<string, boolean>) || {};

    // Get Background Image data
    const semester = courseData.find(sem => sem.id === `semester-${currentSemester}`);
    const backgroundImage = semester?.backgroundImage || '/540598ldsdl.jpg'; // Default BG

    // --- Render Structure --- 
    return (
      <div className="relative min-h-screen w-full bg-black/75"> 
        {/* Background Image - Restore fixed position and z-index */}
        <div 
          className="fixed inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1
          }}
        />

        {/* Radial Vignette Overlay - Restore this */}
        <div 
          className="fixed inset-0 w-full h-full"
          style={{
            background: `radial-gradient(circle at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.95) 100%)`,
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 2
          }}
        />

        {/* Render Components (Moved here) - Need to ensure they appear above the overlay */}
        <div className="relative z-10"> 
            <LogoSection semesterId={semesterId} /> 
            <UserMenu /> 
            <Sidebar 
              courseData={courseData}
              currentSemester={currentSemester}
              completedUnits={completedUnits}
            />

            {/* Main Content - Also needs to be within the z-10 wrapper */}
            <main className="relative min-h-screen w-full">{children}</main>
        </div>

      </div>
    );

  } catch (error) {
    console.error('Unexpected error in [semesterId] layout:', {
      error: safeStringifyError(error),
      params,
      timestamp: new Date().toISOString()
    });
    return (
      <div className="error-state">
        <h1>Semester Layout Error</h1>
        <p>Something went wrong.</p>
      </div>
    );
  }
} 