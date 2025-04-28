// app/course/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import UserMenu from '../_components/UserMenu'
import { redirect } from 'next/navigation'
import LogoSection from '@/app/_components/LogoSection'
import courseData from '@/app/_components/(semester1)/courseData'
import Sidebar from '../_components/sidebar'

// Helper function to safely stringify error details
function safeStringifyError(error: any): string {
  try {
    return JSON.stringify({
      message: error?.message || 'No message',
      name: error?.name || 'Unknown error',
      code: error?.code || 'No code',
      details: error?.details || 'No details',
      hint: error?.hint || 'No hint',
      stack: error?.stack || 'No stack trace'
    }, null, 2)
  } catch (e) {
    return `Error stringifying error: ${e}`
  }
}

// By default, layout.tsx is a Server Component. We can do server logic here.
export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { semesterId: string }
}) {
  try {
    // Log the rendering of the course layout
    console.log('Rendering course layout with params:', params)

    // 1. Create Supabase client with properly awaited cookies
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // 2. Get session with proper error handling
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // Log session check for debugging
    console.log('Session check in course layout:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      error: sessionError ? safeStringifyError(sessionError) : null
    })

    // 3. Redirect if no session or error
    if (sessionError) {
      console.error('Session error in course layout:', safeStringifyError(sessionError))
      redirect('/auth/signin')
    }
    
    if (!session?.user) {
      console.log('No session found in course layout, redirecting to signin')
      redirect('/auth/signin')
    }

    // 4. Check if user exists in Supabase DB
    const { data: dbUser, error: dbError } = await supabase
      .from('User')
      .select('*')
      .eq('auth_id', session.user.id)
      .single()

    // Log database query result
    console.log('Database query result:', {
      hasUser: !!dbUser,
      userId: dbUser?.id,
      error: dbError ? safeStringifyError(dbError) : null
    })

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Database error checking user in layout:', {
        error: safeStringifyError(dbError),
        userId: session.user.id,
        query: {
          table: 'User',
          select: '*',
          filter: { auth_id: session.user.id }
        }
      })
      redirect('/auth/signin')
    }

    if (!dbUser) {
      // Create new user if they don't exist
      const { data: newUser, error: createError } = await supabase
        .from('User')
        .insert([
          {
            auth_id: session.user.id,
            email: session.user.email,
            role: 'STUDENT',
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || ''
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('Error creating new user:', safeStringifyError(createError))
        redirect('/auth/signin')
      }

      console.log('Created new user:', {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      })
    } else {
      console.log('User found in DB for layout:', {
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role
      })
    }

    // Determine current semester for background image
    const currentSemester = params.semesterId
      ? parseInt(params.semesterId.replace('semester-', ''), 10)
      : 1

    const semester = courseData.find((sem) => sem.id === `semester-${currentSemester}`)
    const backgroundImage = semester?.backgroundImage || '/540598ldsdl.jpg'

    // Fetch user progress
    const { data: progressData, error: progressError } = await supabase
      .from('UnitProgress')
      .select('unitId, videoCompleted, questionsCompleted, totalQuestions')
      .eq('userId', session.user.id)
      .eq('videoCompleted', true)
      .gte('questionsCompleted', 5);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
    }

    // Create a map of completed units
    const completedUnits = progressData?.reduce((acc, unit) => {
      acc[unit.unitId] = true;
      return acc;
    }, {} as Record<string, boolean>) || {};

    console.log('Rendering course layout for semester number:', currentSemester)

    return (
      <div className="relative min-h-screen w-full bg-black">
        {/* Background Image with Overlays */}
        <div className="fixed inset-0">
          <div
            className="absolute inset-0 w-full h-full animated-bg"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              transition: 'background-image 0.5s ease-in-out',
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
        </div>

        {/* Logo Section */}
        <LogoSection />

        {/* User Menu (Top Right) */}
        <div className="fixed z-50 top-5 right-5">
          <UserMenu />
        </div>

        {/* Sidebar with curriculum tiles - Now will display correct progress */}
        <div className="fixed z-40 bg-gradient-to-r from-black/50 to-transparent">
            <Sidebar 
              courseData={courseData}
              currentSemester={currentSemester}
              completedUnits={completedUnits}
            />
          </div>

        {/* Main Content */}
        <main className="relative min-h-screen w-full">{children}</main>
      </div>
    )
  } catch (error) {
    console.error('Unexpected error in course layout:', {
      error: safeStringifyError(error),
      params,
      timestamp: new Date().toISOString()
    })
    // Instead of redirecting on error, we'll show an error state
    return (
      <div className="relative min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Something went wrong</h1>
          <p className="text-gray-400">Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </div>
    )
  }
}
