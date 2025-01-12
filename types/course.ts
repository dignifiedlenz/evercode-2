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
    backgroundImage: string; // URL or path to the image
    units: Unit[];
  }
  
  export interface Semester {
    id: string;
    title: string;
    chapters: Chapter[];
  }

  
  export interface CompletedUnits {
    [chapterId: string]: string[];
  }