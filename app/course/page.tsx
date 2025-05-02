// app/course/page.tsx
import { redirect } from "next/navigation";
import courseData from "@/app/_components/(semester1)/courseData";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Track redirection attempts to prevent loops
let redirectCount = 0;
let lastRedirectTime = 0;
const MAX_REDIRECTS = 2;
const REDIRECT_WINDOW = 10000; // 10 seconds

export default async function CoursePage() {
  // Log the rendering of the course page
  console.log('Rendering course page');
  
  // Create Supabase client with standard pattern - await cookies to fix dynamic API warning
  const cookiesInstance = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookiesInstance });
  
  // Use getUser() for more secure session handling
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  console.log('User check in course page:', { 
    hasUser: !!user, 
    userId: user?.id,
    error: userError
  });
  
  if (userError || !user) {
    console.log('No authenticated user found in course page, redirecting to signin');
    redirect('/auth/signin');
  }
  
  // Check if we're in a redirect loop
  const now = Date.now();
  if (now - lastRedirectTime > REDIRECT_WINDOW) {
    redirectCount = 0;
  }
  
  redirectCount++;
  lastRedirectTime = now;
  
  console.log(`CoursePage redirect count: ${redirectCount}`);
  
  // Redirect to the first available semester - but only if we're not in a loop
  if (redirectCount <= MAX_REDIRECTS) {
    console.log('Redirecting to the first semester');
    const firstSemesterId = courseData[0]?.id || "semester-1";
    redirect(`/course/${firstSemesterId}`);
  }
  
  // If we're in a redirect loop, just render the dashboard directly
  console.log('BREAKING REDIRECT LOOP - rendering dashboard directly');
  
  // Instead of redirecting, render a fallback
  return (
    <div className="min-h-screen w-full bg-black/95 text-white">
      <div className="fixed inset-0 w-full h-full bg-black/90"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-6">Course Dashboard</h1>
        <p className="mb-4">Welcome to your course.</p>
        <a 
          href="/course/semester-1" 
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go to Semester 1
        </a>
      </div>
    </div>
  );
}
