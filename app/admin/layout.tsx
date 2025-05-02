import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookiesInstance = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookiesInstance });
  
  // Check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  // Log session check for debugging
  console.log('Session check in admin layout:', { 
    hasSession: !!session, 
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    error: sessionError
  });

  if (sessionError) {
    console.error('Session error in admin layout:', sessionError);
    redirect('/auth/signin');
  }
  
  if (!session?.user) {
    console.log('No session found in admin layout, redirecting to signin');
    redirect('/auth/signin');
  }

  // Fetch user data from database using auth_id
  try {
    console.log('Looking up user in database with auth_id:', session.user.id);
    
    const dbUser = await prisma.user.findUnique({
      where: { auth_id: session.user.id },
    });

    console.log('Database lookup result:', { 
      found: !!dbUser,
      userId: dbUser?.id,
      email: dbUser?.email,
      role: dbUser?.role
    });

    if (!dbUser) {
      console.error('User found in Supabase Auth but not in database:', session.user.id);
      redirect('/auth/signin');
    }
    
    // Check admin roles
    if (
      dbUser.role !== 'ROOT_ADMIN' && 
      dbUser.role !== 'SUPER_ADMIN' && 
      dbUser.role !== 'REGIONAL_ADMIN' && 
      dbUser.role !== 'LOCAL_ADMIN'
    ) {
      console.log('User does not have admin role, redirecting to course:', dbUser.role);
      redirect('/course/semester-1');
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  } catch (error) {
    console.error('Error in admin layout:', error);
    redirect('/auth/signin');
  }
} 