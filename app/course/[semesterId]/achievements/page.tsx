// @ts-nocheck
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import courseData from "@/app/_components/(semester1)/courseData";
import { Metadata } from "next";

// Generate metadata for the page
export const metadata: Metadata = {
  title: 'Achievements',
  description: 'Track your progress and achievements'
};

// Main page component with simplified type annotations
export default async function AchievementsPage({ params }: {
  params: { semesterId: string }
}) {
  const { semesterId } = params;
  
  // Authentication check
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/signin");
  }

  // Get user data with progress information
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      completedUnits: true
    }
  });

  if (!dbUser) {
    redirect("/signup");
  }

  // Get semester data
  const currentSemester = parseInt(semesterId.replace('semester-', ''), 10) || 1;
  const semester = courseData.find(sem => sem.id === `semester-${currentSemester}`);
  
  if (!semester) {
    return (
      <div className="p-8 text-white">
        Semester not found
      </div>
    );
  }
  
  // Calculate completed units and total units
  const completedUnits = dbUser.completedUnits as Record<string, string[]> || {};
  const totalCompleted = Object.values(completedUnits).reduce(
    (acc, units) => acc + units.length, 0
  );
  
  // Calculate total units in the semester
  const totalUnitsInSemester = semester.chapters.reduce(
    (acc, chapter) => acc + chapter.units.length, 0
  );
  
  // Calculate chapter completion
  const chapterCompletions = semester.chapters.map(chapter => {
    const chapterUnits = chapter.units.length;
    const completedInChapter = completedUnits[chapter.id]?.length || 0;
    const percentComplete = chapterUnits > 0 
      ? Math.round((completedInChapter / chapterUnits) * 100) 
      : 0;
      
    return {
      id: chapter.id,
      title: chapter.title,
      completed: completedInChapter,
      total: chapterUnits,
      percent: percentComplete
    };
  });
  
  return (
    <div className="p-8 backdrop-blur-sm bg-black/30 rounded-lg max-w-4xl mx-auto mt-16">
      <h1 className="text-4xl font-morion text-white mb-6">My Achievements</h1>
      
      <div className="grid gap-6">
        {/* Progress Overview */}
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <h2 className="text-xl text-white mb-4">Progress Overview</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-secondary/30 w-16 h-16 rounded-full flex items-center justify-center">
              <span className="text-secondary text-xl">{totalCompleted}</span>
            </div>
            <div>
              <p className="text-white">Total Units Completed</p>
              <p className="text-white/60 text-sm">
                {totalCompleted} of {totalUnitsInSemester} units completed in Semester {currentSemester}
              </p>
            </div>
          </div>
          
          {/* Chapter Progress */}
          <div className="space-y-2 mt-6">
            <h3 className="text-white text-lg mb-2">Chapter Progress</h3>
            {chapterCompletions.map(chapter => (
              <div key={chapter.id} className="bg-white/5 p-3 rounded">
                <div className="flex justify-between text-white mb-1">
                  <span>{chapter.title}</span>
                  <span>{chapter.completed}/{chapter.total}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary"
                    style={{ width: `${chapter.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Achievements */}
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <h2 className="text-xl text-white mb-4">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${totalCompleted >= 1 ? 'bg-secondary/20 border-secondary' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <h3 className="text-white font-semibold">First Step</h3>
              <p className="text-white/60 text-sm">Complete your first unit</p>
            </div>
            <div className={`p-4 rounded-lg border ${totalCompleted >= 5 ? 'bg-secondary/20 border-secondary' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <h3 className="text-white font-semibold">Getting Started</h3>
              <p className="text-white/60 text-sm">Complete 5 units</p>
            </div>
            <div className={`p-4 rounded-lg border ${totalCompleted >= 10 ? 'bg-secondary/20 border-secondary' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <h3 className="text-white font-semibold">On a Roll</h3>
              <p className="text-white/60 text-sm">Complete 10 units</p>
            </div>
            <div className={`p-4 rounded-lg border ${totalCompleted >= 20 ? 'bg-secondary/20 border-secondary' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <h3 className="text-white font-semibold">Dedicated Learner</h3>
              <p className="text-white/60 text-sm">Complete 20 units</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 