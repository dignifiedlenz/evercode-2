// app/course/page.tsx
import { redirect } from "next/navigation";
import courseData from "@/app/_components/(semester1)/courseData";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function CoursePage() {
  // Log the rendering of the course page
  console.log('Rendering course page');
  
  // Pass cookies directly via function
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  
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
  
  // Redirect to the first available semester
  console.log('Redirecting to the first semester');
  const firstSemesterId = courseData[0]?.id || "semester-1";
  redirect(`/course/${firstSemesterId}`);
  
  // This return is never reached but required for TypeScript
  return null;
}
