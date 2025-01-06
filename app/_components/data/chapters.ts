// data/chapters.ts
export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string; // Optional: For validation or scoring
  }
  
  export interface Chapter {
    id: number;
    title: string;
    videoSrc: string;
    quiz: QuizQuestion[];
  }
  
  export const chapters: Chapter[] = [
    {
      id: 1,
      title: "Chapter 1: Introduction",
      videoSrc: "/videos/video1.mp4",
      quiz: [
        {
          question: "1. What is the purpose of this course?",
          options: [
            "To learn cooking.",
            "To learn programming.",
            "To learn painting.",
            "To learn dancing.",
          ],
          correctAnswer: "To learn programming.",
        },
        // Add questions 2 to 5
        {
          question: "2. Which language is used for web development?",
          options: ["Python", "HTML", "C++", "Java"],
          correctAnswer: "HTML",
        },
        {
          question: "3. What does CSS stand for?",
          options: [
            "Computer Style Sheets",
            "Cascading Style Sheets",
            "Creative Style System",
            "Colorful Style Sheets",
          ],
          correctAnswer: "Cascading Style Sheets",
        },
        {
          question: "4. What tag is used to create a hyperlink in HTML?",
          options: [
            "<link>",
            "<a>",
            "<href>",
            "<hyperlink>",
          ],
          correctAnswer: "<a>",
        },
        {
          question: "5. Which of the following is a JavaScript framework?",
          options: ["Laravel", "Django", "React", "Flask"],
          correctAnswer: "React",
        },
      ],
    },
    // Define Chapters 2 to 4 similarly
    {
      id: 2,
      title: "Chapter 2: Advanced Topics",
      videoSrc: "/videos/video2.mp4",
      quiz: [
        {
          question: "1. What is TypeScript?",
          options: [
            "A styling language",
            "A superset of JavaScript",
            "A database",
            "A backend framework",
          ],
          correctAnswer: "A superset of JavaScript",
        },
        // Add questions 2 to 5
        {
          question: "2. Which of these is a React hook?",
          options: ["useState", "useClass", "useContextAPI", "useRedux"],
          correctAnswer: "useState",
        },
        {
          question: "3. What does JSX stand for?",
          options: [
            "JavaScript XML",
            "Java Syntax Extension",
            "JavaScript Extended",
            "JSON XML",
          ],
          correctAnswer: "JavaScript XML",
        },
        {
          question: "4. What is Next.js primarily used for?",
          options: [
            "Backend development",
            "Mobile app development",
            "Server-side rendering for React applications",
            "Database management",
          ],
          correctAnswer: "Server-side rendering for React applications",
        },
        {
          question: "5. What is Tailwind CSS?",
          options: [
            "A CSS framework",
            "A JavaScript library",
            "A backend framework",
            "A type of database",
          ],
          correctAnswer: "A CSS framework",
        },
      ]}
    // Add Chapters 3 and 4 similarly
  ];
  