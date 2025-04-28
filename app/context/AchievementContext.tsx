"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { Achievement, checkAndUnlockAchievements } from '@/app/actions/achievements';
import AchievementNotification from '@/app/_components/AchievementNotification';

interface AchievementContextType {
  showAchievement: (achievement: Achievement) => void;
  checkProgress: (progress: {
    completedUnits: number;
    completedQuizzes: number;
    completedChapters: number;
  }) => Promise<void>;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const showAchievement = (achievement: Achievement) => {
    setCurrentAchievement(achievement);
  };

  const handleClose = () => {
    setCurrentAchievement(null);
  };

  const checkProgress = async (progress: {
    completedUnits: number;
    completedQuizzes: number;
    completedChapters: number;
  }) => {
    const unlocked = await checkAndUnlockAchievements(progress);
    unlocked.forEach((achievement: Achievement) => {
      showAchievement(achievement);
    });
  };

  return (
    <AchievementContext.Provider value={{ showAchievement, checkProgress }}>
      {children}
      {currentAchievement && (
        <AchievementNotification
          achievement={currentAchievement}
          onClose={handleClose}
        />
      )}
    </AchievementContext.Provider>
  );
}

export function useAchievement() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievement must be used within an AchievementProvider');
  }
  return context;
} 