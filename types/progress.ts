// Progress tracking types
export interface VideoProgress {
  videoId: string;
  chapterId: string;
  unitId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastUpdated: Date;
}

export interface QuestionProgress {
  questionId: string;
  chapterId: string;
  unitId: string;
  answered: boolean;
  correct: boolean;
  lastUpdated: Date;
}

export interface UnitProgress {
  unitId: string;
  chapterId: string;
  videoCompleted: boolean;
  questionsCompleted: boolean;
  completed: boolean;
  lastAccessed: Date;
}

export interface CourseProgress {
  userId: string;
  videos: VideoProgress[];
  questions: QuestionProgress[];
  units: UnitProgress[];
} 