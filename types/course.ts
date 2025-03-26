// src/types/course.ts

export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }
  
  export interface Video {
    id: string;
    title: string;
    videoUrl: string;
    questions: Question[];
  }
  
  export interface Unit {
    id: string;
    title: string;
    video: Video;
  }
  
  export interface Chapter {
    id: string;
    title: string;
    description: string;
    backgroundImage: string;
    units: Unit[];
  }
  
  export interface Instructor {
    id: string;
    name: string;
    description: string;
    profileImage: string;
    role: string;
    introductionVideo: string;
  }
  
  export interface Semester {
    id: string;
    title: string;
    description: string;
    backgroundImage: string;
    chapters: Chapter[];
    instructors: Instructor[];
  }

  
  export interface CompletedUnits {
    [chapterId: string]: string[];
  }