export type Achievement = {
  id: string; // uuid
  name: string; // text
  description: string; // text
  icon: string; // text - Assuming this stores an identifier for an icon component or image path
  threshold: number; // int4
  type: string; // text - e.g., 'TASK_COMPLETION', 'LOGIN_STREAK'
  created_at: string; // timestamptz
};

export type UserAchievement = {
  id: string; // uuid
  user_id: string; // uuid
  achievement_id: string; // uuid
  progress: number; // int4
  unlocked_at: string | null; // timestamptz, nullable if not yet unlocked
  created_at: string; // timestamptz
};
