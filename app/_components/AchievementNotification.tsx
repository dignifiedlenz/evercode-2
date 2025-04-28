"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/app/actions/achievements';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-black/90 border border-secondary/50 rounded-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="bg-secondary/20 p-2 rounded-full">
                <span className="text-secondary text-xl">{achievement.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-morion-medium">{achievement.name}</h3>
                <p className="text-white/60 text-sm mt-1">{achievement.description}</p>
              </div>
              <button
                onClick={() => {
                  setIsVisible(false);
                  onClose();
                }}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 