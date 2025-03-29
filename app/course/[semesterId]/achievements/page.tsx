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

  // Get user data with progress information and quiz details
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      progress: {
        include: {
          quizProgressDetails: true,
          unitProgress: true
        }
      }
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
  
  // Calculate completed units using unitProgress
  const completedUnits = dbUser.progress?.unitProgress.reduce((acc, progress) => {
    if (progress.questionsCompleted && progress.videoCompleted) {
      if (!acc[progress.chapterId]) {
        acc[progress.chapterId] = [];
      }
      acc[progress.chapterId].push(progress.unitId);
    }
    return acc;
  }, {} as Record<string, string[]>) || {};

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

  // Calculate quiz statistics
  const quizStats = dbUser.progress?.quizProgressDetails.reduce((acc, detail) => {
    acc.totalAttempts += detail.attempts;
    acc.totalQuestions += 1;
    if (detail.completedAt) {
      acc.completedQuestions += 1;
    }
    return acc;
  }, { totalAttempts: 0, totalQuestions: 0, completedQuestions: 0 }) || 
  { totalAttempts: 0, totalQuestions: 0, completedQuestions: 0 };

  const averageAttempts = quizStats.completedQuestions > 0 
    ? (quizStats.totalAttempts / quizStats.completedQuestions).toFixed(1)
    : 0;
  
  return (
    <div className="p-8 backdrop-blur-sm bg-black/30 rounded-lg max-w-4xl mx-auto my-8 overflow-y-auto">
      {/* User Info Section */}
      <div className="flex items-center gap-6 mb-8">
        <div className="bg-secondary/20 w-20 h-20 rounded-full flex items-center justify-center border border-secondary/30">
          <span className="text-secondary text-2xl font-morion">
            {dbUser.firstName?.[0]}{dbUser.lastName?.[0]}
          </span>
        </div>
        <div>
          <h1 className="text-4xl font-morion text-white">{dbUser.firstName} {dbUser.lastName}</h1>
          <p className="text-white/60 mt-1">Semester {currentSemester} Student</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {/* Progress Overview */}
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <h2 className="text-xl text-white mb-4">Progress Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/30 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-secondary text-lg">{totalCompleted}</span>
                </div>
                <div>
                  <p className="text-white text-sm">Units Completed</p>
                  <p className="text-white/60 text-xs">
                    {Math.round((totalCompleted / totalUnitsInSemester) * 100)}% Complete
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/30 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-secondary text-lg">{quizStats.completedQuestions}</span>
                </div>
                <div>
                  <p className="text-white text-sm">Quizzes Completed</p>
                  <p className="text-white/60 text-xs">
                    {quizStats.totalQuestions} Total Quizzes
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/30 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-secondary text-lg">{averageAttempts}</span>
                </div>
                <div>
                  <p className="text-white text-sm">Average Attempts</p>
                  <p className="text-white/60 text-xs">
                    Per Completed Quiz
                  </p>
                </div>
              </div>
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
                    className="h-full bg-secondary transition-all duration-500"
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