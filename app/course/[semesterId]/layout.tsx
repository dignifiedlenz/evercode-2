// Remove 'use client'
// import { useParams, redirect, useRouter } from 'next/navigation'; // Remove client hooks
// import { useState, useEffect, useMemo } from 'react'; // Remove client hooks
import { cookies } from 'next/headers'; // Import server cookies
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'; // Import server client
import { redirect } from 'next/navigation'; // Keep redirect
import UserMenu from '@/app/_components/UserMenu';
import LogoSection from '@/app/_components/LogoSection';
import courseData from "@/app/_components/(semester1)/courseData";
import Sidebar from '@/app/_components/sidebar';
// import { useAuth } from '@/context/AuthContext'; // Remove client auth context

// Use a longer delay before allowing a redirect to happen
// This will ensure the auth cookies have time to be processed
const AUTH_WAIT_DELAY_MS = 500;

// Store redirect counter in memory (will reset on server restart)
let redirectCounter = 0;
let lastRedirectTime = 0;
const REDIRECT_WINDOW_MS = 10000; // 10 seconds
const MAX_REDIRECTS = 3;

// Helper for safe stringify (optional, can remove if not debugging complex errors)
function safeStringifyError(error: any): string {
  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  } catch {
    return `Could not stringify error: ${error?.message || 'Unknown error'}`;
  }
}


interface LayoutProps {
  children: React.ReactNode;
  params: { semesterId: string }; // Get params directly
}

// Prevent infinite redirect loops
function shouldAllowAuthRedirect(): boolean {
  const now = Date.now();
  
  // Reset counter if it's been a while
  if (now - lastRedirectTime > REDIRECT_WINDOW_MS) {
    redirectCounter = 0;
  }
  
  // Increment counter and update timestamp
  redirectCounter++;
  lastRedirectTime = now;
  
  // Log the redirect attempt
  console.log(`[Server Layout] Redirect counter: ${redirectCounter}`);
  
  // Allow redirect if we're under the limit
  return redirectCounter <= MAX_REDIRECTS;
}

// Make the layout an async function
export default async function SemesterLayout({ children, params: paramsProp }: LayoutProps) {
  
  // --- Await props only --- 
  const params = await paramsProp; 
  // const cookieStore = await cookies(); // Revert explicit await
  // --- End Await --- 

  // Add a delay to give auth cookie time to be processed
  await new Promise(resolve => setTimeout(resolve, AUTH_WAIT_DELAY_MS));

  let user = null;
  let dbUser = null;
  let initialCompletedUnits: Record<string, boolean> = {}; // Default empty

  try {
    console.log('[Server Layout] Rendering with awaited params:', params);

    // Use standard pattern with cookies directly
    const cookiesInstance = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookiesInstance });

    // Perform auth check server-side
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
    console.log('[Server Layout] Auth check result:', { hasUser: !!authUser, userId: authUser?.id });

    if (userError || !authUser) {
      console.error('[Server Layout] Auth error or no user:', userError ? safeStringifyError(userError) : 'No user');
      
      // Check if we should allow a redirect
      if (!shouldAllowAuthRedirect()) {
        console.log('[Server Layout] BREAKING REDIRECT LOOP: Continuing without redirect');
        // Return minimal layout without data to break the loop
        return (
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="text-center p-8">
              <h1 className="text-2xl mb-4">Authentication Error</h1>
              <p>There was a problem authenticating your session.</p>
              <a href="/auth/signin" className="text-blue-400 underline mt-4 block">Click here to sign in</a>
            </div>
          </div>
        );
      }
      
      // Allow the redirect
      console.log('[Server Layout] Redirecting to signin page');
      redirect('/auth/signin');
    }
    
    // Assign the authenticated user
    user = authUser; 

    // --- Re-enable DB user check/creation ---
    console.log('[Server Layout] Checking user in DB...');
    const { data: foundDbUser, error: dbError } = await supabase
      .from('User')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // Ignore 'not found' error PGRST116
      console.error('[Server Layout] Error fetching user from DB:', safeStringifyError(dbError));
      // Optional: redirect to an error page or handle differently
      redirect('/auth/signin?error=database_error'); 
    }

    if (!foundDbUser) {
      console.log('[Server Layout] User not found in DB, creating...');
      const { data: createdUser, error: createError } = await supabase.from('User').insert({
         auth_id: user.id,
         email: user.email, 
         role: 'USER', // Ensure this matches your enum
         firstName: user.user_metadata?.firstName || '', 
         lastName: user.user_metadata?.lastName || ''
      }).select().single(); // Select the created user data

      if (createError) {
         console.error('[Server Layout] Error creating user:', safeStringifyError(createError));
         // Optional: redirect to an error page or handle differently
         redirect('/auth/signin?error=user_creation_failed');
      }
      console.log('[Server Layout] User created in DB:', createdUser);
      dbUser = createdUser; // Use the newly created user data
    } else {
      console.log('[Server Layout] User found in DB:', foundDbUser);
      dbUser = foundDbUser; // Use the found user data
    }
    // --- End DB user check/creation ---


    // --- Re-enable Progress Fetch ---
    console.log('[Server Layout] Fetching initial progress...');
    const { data: progressData, error: progressError } = await supabase
        .from('UnitProgress')
        .select('unitId, videoCompleted, questionsCompleted, totalQuestions') // Select necessary fields
        .eq('userId', user.id); // Use the authenticated user's ID

    if (progressError) {
        console.error('[Server Layout] Error fetching progress:', safeStringifyError(progressError));
        // Don't fail the whole page load, just log and continue with empty progress
        initialCompletedUnits = {};
    } else {
        // Process progress data to create the initialCompletedUnits map
        initialCompletedUnits = progressData.reduce((acc, unit) => {
            // Consider a unit complete if video is watched AND all questions answered
            const isComplete = unit.videoCompleted && unit.questionsCompleted >= unit.totalQuestions;
            acc[unit.unitId] = isComplete;
            return acc;
        }, {} as Record<string, boolean>);
        console.log(`[Server Layout] Initial progress fetched. ${Object.keys(initialCompletedUnits).length} units processed.`);
    }
    // --- End Progress Fetch ---


  } catch (error) {
     console.error('[Server Layout] UNEXPECTED CATCH BLOCK:', safeStringifyError(error));
     // Redirect on unexpected errors during server-side setup
     redirect('/auth/signin?error=unexpected_layout_error');
  }

  // Extract semester details from awaited params
  const semesterId = params.semesterId;
  const currentSemester = semesterId ? parseInt(semesterId.replace('semester-', ''), 10) : 1;
  const semester = courseData.find(sem => sem.id === `semester-${currentSemester}`);
  const backgroundImage = semester?.backgroundImage || '/540598ldsdl.jpg';

  return (
    <div className="relative min-h-screen w-full bg-black/75">
      {/* Background Image */}
      <div 
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1 // Lower z-index than content
        }}
      />
      {/* Vignette Overlay */}
      <div 
        className="fixed inset-0 w-full h-full"
        style={{
          background: `radial-gradient(circle at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.95) 100%)`,
          zIndex: 2 // Between background and content
        }}
      />

      {/* Content Area with higher z-index */}
      <div className="relative z-10"> 
        {/* Components now receive data via props if needed, or use client context */}
        <LogoSection semesterId={semesterId} /> 
        {/* UserMenu might still use useAuth client-side, which is fine */}
        <UserMenu /> 
        {/* Re-enabled with improved error handling */}
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