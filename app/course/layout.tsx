// app/course/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserMenu from "../_components/UserMenu";
import { redirect } from "next/navigation";
import { Logo } from "@/app/_components/_media/logo";
import Link from "next/link";
import Sidebar from "@/app/_components/sidebar";
import courseData from "@/app/_components/(semester1)/courseData";
import SemesterSelector from "@/app/_components/SemesterSelector";

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
  });

  if (!dbUser) {
    redirect("/signin");
  }

  const completedUnits: CompletedUnits = (dbUser.completedUnits as CompletedUnits) || {};
  
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
      
      {/* Sidebar with curriculum tiles */}
      <div className="fixed left-0 top-0 h-full z-40 bg-gradient-to-r from-black/80 to-transparent">
        <Sidebar 
          courseData={courseData} 
          currentSemester={currentSemester} 
          completedUnits={completedUnits} 
        />
      </div>

      {/* Logo */}
      <Link href="/course" className="fixed left-5 top-3 opacity-65 hover:opacity-100 z-50">
        <Logo />
      </Link>

      {/* Logo Text and Semester Selector */}
      <div className="fixed left-20 top-3 flex flex-col items-start font-morion opacity-100 z-50">
        <img src="/EvermodeTypeLogo.svg" alt="Evermode" className="w-40 h-10" />
        <SemesterSelector currentSemester={currentSemester}/>
      </div>

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
