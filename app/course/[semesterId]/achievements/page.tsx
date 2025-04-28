"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Trophy, Flame, BookOpen, CheckCircle, Calendar, Clock } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'streak' | 'units' | 'quizzes' | 'chapters' | 'time' | 'consistency';
  threshold: number;
  progress: number;
  unlocked_at: string | null;
  icon: string;
}

export default function AchievementsPage() {
  const pathname = usePathname();
  const [semesterId, setSemesterId] = useState<string>("");
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract semesterId from URL path
  useEffect(() => {
    const pathSegments = pathname.split('/');
    const sid = pathSegments[2] || "";
    setSemesterId(sid);
    setCurrentSemester(parseInt(sid.replace('semester-', ''), 10) || 1);
  }, [pathname]);

  useEffect(() => {
    // Mock achievements data - in a real app, these would come from an API
    const mockAchievements: Achievement[] = [
      {
        id: "streak-1",
        name: "7-Day Streak",
        description: "Study for 7 days in a row",
        type: "streak",
        threshold: 7,
        progress: 5,
        unlocked_at: null,
        icon: "flame"
      },
      {
        id: "units-1",
        name: "Unit Master",
        description: "Complete 5 units",
        type: "units",
        threshold: 5,
        progress: 3,
        unlocked_at: null,
        icon: "book"
      },
      {
        id: "quizzes-1",
        name: "Quiz Champion",
        description: "Complete 10 quizzes with 80% or higher",
        type: "quizzes",
        threshold: 10,
        progress: 7,
        unlocked_at: null,
        icon: "check"
      },
      {
        id: "time-1",
        name: "Time Warrior",
        description: "Study for 20 hours this semester",
        type: "time",
        threshold: 20,
        progress: 15,
        unlocked_at: null,
        icon: "clock"
      },
      {
        id: "consistency-1",
        name: "Consistent Learner",
        description: "Study at least 3 times per week for 4 weeks",
        type: "consistency",
        threshold: 12,
        progress: 8,
        unlocked_at: null,
        icon: "calendar"
      }
    ];

    setAchievements(mockAchievements);
    setLoading(false);
  }, [currentSemester]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'streak':
        return <Flame className="w-6 h-6 text-orange-500" />;
      case 'units':
        return <BookOpen className="w-6 h-6 text-blue-500" />;
      case 'quizzes':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'time':
        return <Clock className="w-6 h-6 text-purple-500" />;
      case 'consistency':
        return <Calendar className="w-6 h-6 text-yellow-500" />;
      default:
        return <Trophy className="w-6 h-6 text-gray-500" />;
    }
  };

  const getProgressPercentage = (progress: number, threshold: number) => {
    return Math.min((progress / threshold) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 backdrop-blur-sm bg-black/30 rounded-lg max-w-7xl mx-auto mt-16">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-morion text-white">Semester {currentSemester} Achievements</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                {getIcon(achievement.type)}
                <h3 className="text-white font-medium">{achievement.name}</h3>
              </div>
              
              <p className="text-white/60 text-sm mb-4">{achievement.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Progress</span>
                  <span className="text-white/60">
                    {achievement.progress}/{achievement.threshold}
                  </span>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${getProgressPercentage(achievement.progress, achievement.threshold)}%`
                    }}
                  />
                </div>
                
                {achievement.unlocked_at && (
                  <p className="text-xs text-green-500 mt-2">
                    Unlocked on {new Date(achievement.unlocked_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg border border-white/10 p-4">
            <h3 className="text-white/60 text-sm mb-2">Current Streak</h3>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl text-white font-medium">5 days</span>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg border border-white/10 p-4">
            <h3 className="text-white/60 text-sm mb-2">Total Study Time</h3>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="text-2xl text-white font-medium">15 hours</span>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg border border-white/10 p-4">
            <h3 className="text-white/60 text-sm mb-2">Completion Rate</h3>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-2xl text-white font-medium">75%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 