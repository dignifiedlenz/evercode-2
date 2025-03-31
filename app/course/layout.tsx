// app/course/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserMenu from "../_components/UserMenu";
import { redirect } from "next/navigation";
import LogoSection from "@/app/_components/LogoSection";
import courseData from "@/app/_components/(semester1)/courseData";

// Define the type for CompletedUnits if not already defined
interface CompletedUnits {
  [chapterId: string]: string[];
}

// By default, layout.tsx is a Server Component. We can do server logic here.
export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { semesterId?: string };
}) {
  // 1. Retrieve and validate user session
  const session = await getServerSession(authOptions);
  
  // 2. Redirect if no session
  if (!session?.user?.email) {
    redirect("/signin");
  }

  // 3. Fetch user data from database
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      progress: {
        include: {
          unitProgress: true
        }
      }
    }
  });

  if (!dbUser) {
    redirect("/signin");
  }

  const completedUnits: CompletedUnits = dbUser.progress?.unitProgress.reduce((acc, progress) => {
    if (progress.questionsCompleted && progress.videoCompleted) {
      if (!acc[progress.chapterId]) {
        acc[progress.chapterId] = [];
      }
      acc[progress.chapterId].push(progress.unitId);
    }
    return acc;
  }, {} as CompletedUnits) || {};
  
  // Determine current semester - default to 1 if not specified
  const currentSemester = params.semesterId ? parseInt(params.semesterId.replace('semester-', ''), 10) : 1;
  
  // Find semester data
  const semester = courseData.find(sem => sem.id === `semester-${currentSemester}`);
  const backgroundImage = semester?.backgroundImage || '/540598ldsdl.jpg';
  const semesterTitle = semester?.title?.split(': ')[1] || 'Course';

  return (
    <div className="relative min-h-screen w-full bg-black">
      {/* Background Image */}
      <div 
        className="fixed inset-0 w-full h-full animated-bg"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(var(--background-brightness))'
        }}
      />

      {/* Logo Section */}
      <LogoSection completedUnits={completedUnits} />

      {/* User Menu (Top Right) */}
      <div className="fixed z-50 top-5 right-5">
        <UserMenu/>
      </div>

      {/* Main Content */}
      <main className="relative min-h-screen w-full">
        {children}
      </main>
    </div>
  );
}
