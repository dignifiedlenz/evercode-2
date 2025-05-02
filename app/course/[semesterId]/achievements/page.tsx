"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Trophy, Flame, BookOpen, CheckCircle, Zap, Target, Film, GraduationCap, Star } from "lucide-react";
import { useProgress, UnitProgress, VideoProgress } from "@/app/_components/ProgressClient";
import courseData from "@/app/_components/(semester1)/courseData";

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'units' | 'quizzes' | 'intensity' | 'videos' | 'semester';
  unlocked_at: string | null;
  icon: React.ReactNode;
}

const checkEagerLearner = (unitProgress: UnitProgress[] | undefined): { unlocked: boolean; unlocked_at: string | null } => {
  if (!unitProgress || unitProgress.length < 10) {
    return { unlocked: false, unlocked_at: null };
  }
  const completedUnits = unitProgress
    .filter(up => up.videoCompleted && up.questionsCompleted >= up.totalQuestions && up.lastUpdated)
    .sort((a, b) => new Date(a.lastUpdated!).getTime() - new Date(b.lastUpdated!).getTime());
  if (completedUnits.length < 10) {
    return { unlocked: false, unlocked_at: null };
  }
  const twentyFourHours = 24 * 60 * 60 * 1000;
  for (let i = 0; i <= completedUnits.length - 10; i++) {
    const firstUnitTime = new Date(completedUnits[i].lastUpdated!).getTime();
    const tenthUnitTime = new Date(completedUnits[i + 9].lastUpdated!).getTime();
    if (tenthUnitTime - firstUnitTime <= twentyFourHours) {
      return { unlocked: true, unlocked_at: completedUnits[i + 9].lastUpdated!.toISOString() };
    }
  }
  return { unlocked: false, unlocked_at: null };
};

// Helper function to ensure timestamp is ISO string or null
const formatUnlockTimestamp = (timestamp: string | Date | undefined | null): string | null => {
  if (!timestamp) {
    return new Date().toISOString(); // Fallback if timestamp is missing but needed
  }
  if (typeof timestamp === 'string') {
    // Assuming it's already a valid ISO string from Supabase
    // Add validation here if needed
    return timestamp;
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  // If it's something else unexpected, return fallback or null
  console.warn('Unexpected timestamp format:', timestamp);
  return new Date().toISOString(); 
};

export default function AchievementsPage() {
  const pathname = usePathname();
  const [semesterId, setSemesterId] = useState<string>("");
  const [currentSemesterNum, setCurrentSemesterNum] = useState<number>(1);
  const { progress, loading } = useProgress();

  useEffect(() => {
    const pathSegments = pathname.split('/');
    const sid = pathSegments[2] || "";
    setSemesterId(sid);
    setCurrentSemesterNum(parseInt(sid.replace('semester-', ''), 10) || 1);
  }, [pathname]);

  const averageAttempts = useMemo(() => {
    if (!progress?.questionProgress || progress.questionProgress.length === 0) {
      return 0;
    }
    const totalAttempts = progress.questionProgress.reduce((sum, qp) => sum + qp.attempts, 0);
    const totalQuestionsAttempted = progress.questionProgress.length;
    return totalQuestionsAttempted > 0 ? totalAttempts / totalQuestionsAttempted : 0;
  }, [progress]);

  const achievements: Achievement[] = useMemo(() => {
    const userAchievements: Achievement[] = [];
    if (!progress) return [];

    const sortedUnitProgress = [...(progress.unitProgress || [])].sort((a, b) => new Date(b.lastUpdated!).getTime() - new Date(a.lastUpdated!).getTime());
    const sortedQuestionProgress = [...(progress.questionProgress || [])].sort((a, b) => new Date(b.lastUpdated!).getTime() - new Date(a.lastUpdated!).getTime());
    const sortedVideoProgress = [...(progress.videoProgress || [])].sort((a, b) => new Date(b.lastUpdated!).getTime() - new Date(a.lastUpdated!).getTime());

    const completedUnits = sortedUnitProgress.filter(up => up.videoCompleted && up.questionsCompleted >= up.totalQuestions);
    const completedUnitCount = completedUnits.length;
    const lastCompletedUnitTimestamp = completedUnits[0]?.lastUpdated;

    const correctQuestions = sortedQuestionProgress.filter(qp => qp.correct);
    const correctQuestionCount = correctQuestions.length;
    const lastCorrectQuestionTimestamp = correctQuestions[0]?.lastUpdated;

    const completedVideos = sortedVideoProgress.filter(vp => vp.completed);
    const completedVideoCount = completedVideos.length;
    const lastCompletedVideoTimestamp = completedVideos[0]?.lastUpdated;

    userAchievements.push({
      id: "units-1", name: "Unit Explorer", description: "Complete 5 units",
      type: "units",
      unlocked_at: completedUnitCount >= 5 ? formatUnlockTimestamp(lastCompletedUnitTimestamp) : null,
      icon: <BookOpen className="w-6 h-6 text-blue-500" />
    });

    userAchievements.push({
      id: "units-2", name: "Unit Master", description: "Complete 10 units",
      type: "units",
      unlocked_at: completedUnitCount >= 10 ? formatUnlockTimestamp(lastCompletedUnitTimestamp) : null,
      icon: <BookOpen className="w-6 h-6 text-blue-600" />
    });

    const currentSemesterData = courseData.find(s => s.id === semesterId);
    const totalUnitsInSemester = currentSemesterData?.chapters.reduce((sum, chap) => sum + chap.units.length, 0) ?? 0;
    const completedUnitsInSemester = sortedUnitProgress.filter(up => {
      const unitLocation = currentSemesterData?.chapters.find(c => c.units.some(u => u.id === up.unitId));
      return unitLocation && up.videoCompleted && up.questionsCompleted >= up.totalQuestions;
    });
    const completedUnitsInSemesterCount = completedUnitsInSemester.length;
    const lastUnitInSemesterTimestamp = completedUnitsInSemester[0]?.lastUpdated;

    userAchievements.push({
      id: "semester-1", name: "Semester Graduate", description: `Complete all ${totalUnitsInSemester} units in Semester ${currentSemesterNum}`,
      type: "semester",
      unlocked_at: totalUnitsInSemester > 0 && completedUnitsInSemesterCount >= totalUnitsInSemester ? formatUnlockTimestamp(lastUnitInSemesterTimestamp) : null,
      icon: <GraduationCap className="w-6 h-6 text-green-500" />
    });

    userAchievements.push({
      id: "quizzes-1", name: "Quiz Whiz", description: "Answer 100 questions correctly",
      type: "quizzes",
      unlocked_at: correctQuestionCount >= 100 ? formatUnlockTimestamp(lastCorrectQuestionTimestamp) : null,
      icon: <CheckCircle className="w-6 h-6 text-teal-500" />
    });

    const firstTryAceUnlocked = averageAttempts > 0 && averageAttempts < 1.5 && (progress.questionProgress?.length ?? 0) >= 10;
    const lastAttemptTimestamp = sortedQuestionProgress[0]?.lastUpdated;
    userAchievements.push({
        id: "quizzes-2", name: "First Try Ace", description: "Maintain an average of less than 1.5 attempts per question (min. 10 questions attempted)",
        type: "quizzes",
        unlocked_at: firstTryAceUnlocked ? formatUnlockTimestamp(lastAttemptTimestamp) : null,
        icon: <Star className="w-6 h-6 text-yellow-500" />
    });

    const eagerLearnerStatus = checkEagerLearner(progress?.unitProgress);
    userAchievements.push({
      id: "intensity-1", name: "Eager Learner", description: "Complete 10 units within a single day",
      type: "intensity",
      unlocked_at: eagerLearnerStatus.unlocked_at,
      icon: <Zap className="w-6 h-6 text-red-500" />
    });

    userAchievements.push({
      id: "videos-1", name: "Binge Watcher", description: "Watch 10 videos completely",
      type: "videos",
      unlocked_at: completedVideoCount >= 10 ? formatUnlockTimestamp(lastCompletedVideoTimestamp) : null,
      icon: <Film className="w-6 h-6 text-purple-500" />
    });

    return userAchievements;

  }, [progress, averageAttempts, semesterId, currentSemesterNum]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 backdrop-blur-sm bg-black/30 rounded-lg max-w-7xl mx-auto mt-24">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center mb-4">
          <h1 className="text-3xl font-morion text-white mb-2">Semester {currentSemesterNum} Achievements</h1>
          {averageAttempts > 0 && (
            <p className="text-sm text-white/60">
              Average Attempts / Question: 
              <span className="text-base font-medium text-white ml-1">
                {averageAttempts.toFixed(1)}
              </span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-white/5 rounded-lg border border-white/10 p-4 transition-opacity ${achievement.unlocked_at ? 'opacity-100 border-secondary/50' : 'opacity-50'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                {achievement.icon}
                <h3 className={`font-medium ${achievement.unlocked_at ? 'text-white' : 'text-white/70'}`}>{achievement.name}</h3>
              </div>

              <p className="text-white/60 text-sm mb-4">{achievement.description}</p>

              {achievement.unlocked_at ? (
                <p className="text-xs text-secondary">
                  Unlocked on {new Date(achievement.unlocked_at).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-xs text-white/40">Locked</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 