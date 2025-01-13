// src/app/(group)/page.tsx

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import courseData from "../_components/(semester1)/courseData";
import DashboardContent from "./course/_components/DashboardContent";
import { Unit } from "@/types/course";

// Define the shape of completedUnits
interface CompletedUnits {
  [chapterId: string]: string[];
}

export default async function DashboardPage() {
  // 1. Check session server-side
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    // If not signed in, redirect
    redirect("/signin");
  }

  // 2. Fetch user from DB
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!dbUser) {
    // If no user found, redirect to signup
    redirect("/signup");
  }

  // 3. Destructure with default value and type assertion
  const { completedChapters = [], completedUnits = {} } = dbUser;
  const units: CompletedUnits = completedUnits as CompletedUnits;

  const isAdmin = dbUser.role === "admin";

  // 4. Determine the next unit to resume
  let nextSemesterIndex = 0;
  let nextChapterIndex = 0;
  let nextUnitIndex = 0;
  let foundNextUnit = false;

  for (let semesterIdx = 0; semesterIdx < courseData.length; semesterIdx++) {
    const semester = courseData[semesterIdx];
    for (let chapterIdx = 0; chapterIdx < semester.chapters.length; chapterIdx++) {
      const chapter = semester.chapters[chapterIdx];

      for (let unitIdxIter = 0; unitIdxIter < chapter.units.length; unitIdxIter++) {
        const unit = chapter.units[unitIdxIter];
        const isUnitCompleted = units[chapter.id]?.includes(unit.id) ?? false;

        if (!isUnitCompleted) {
          // Found the next incomplete unit
          nextSemesterIndex = semesterIdx;
          nextChapterIndex = chapterIdx;
          nextUnitIndex = unitIdxIter;
          foundNextUnit = true;
          break;
        }
      }

      if (foundNextUnit) break;
    }

    if (foundNextUnit) break;
  }

  // If all units are completed
  if (!foundNextUnit) {
    // Set indices to -1 to indicate completion
    nextSemesterIndex = -1;
    nextChapterIndex = -1;
    nextUnitIndex = -1;
  }

  // 5. Get the title and chapter of the last completed unit
  let lastCompletedTitle = "";
  let lastCompletedChapterTitle = "";

  for (let semesterIdx = 0; semesterIdx < courseData.length; semesterIdx++) {
    const semester = courseData[semesterIdx];
    for (let chapterIdx = 0; chapterIdx < semester.chapters.length; chapterIdx++) {
      const chapter = semester.chapters[chapterIdx];
      if (completedChapters.includes(chapter.id)) {
        for (let unitIdxIter = 0; unitIdxIter < chapter.units.length; unitIdxIter++) {
          const unit = chapter.units[unitIdxIter];
          if (units[chapter.id]?.includes(unit.id)) {
            lastCompletedTitle = unit.title;
            lastCompletedChapterTitle = chapter.title;
          }
        }
      }
    }
  }

  // 6. Calculate total units and completed units for progress percentage
  let totalUnits = 0;
  let totalCompletedUnits = 0;

  courseData.forEach((semester) => {
    semester.chapters.forEach((chapter) => {
      totalUnits += chapter.units.length;
      totalCompletedUnits += units[chapter.id]?.length ?? 0;
    });
  });

  const progressPercentage = (totalCompletedUnits / totalUnits) * 100;

  // 7. Get the title and chapter of the next unit
  let nextUnitTitle = "";
  let nextUnitChapterTitle = "";

  let nextUnit: Unit | null = null; // Replaced 'any' with 'Unit | null'

  if (foundNextUnit) {
    nextUnit = courseData[nextSemesterIndex].chapters[nextChapterIndex].units[nextUnitIndex];
    nextUnitTitle = nextUnit.title;
    nextUnitChapterTitle = courseData[nextSemesterIndex].chapters[nextChapterIndex].title;
  } else {
    nextUnitTitle = "All sessions completed in the course!";
    nextUnitChapterTitle = "";
  }

  // 8. Prepare the "Resume Course" link with the new URL structure
  const resumeCourseLink = foundNextUnit
    ? `/course?session=${nextUnit?.id}` // Changed URL structure
    : "";

  // 9. Get the title of the last completed unit for display
  const lastCompletedUnitDisplay = lastCompletedTitle
    ? lastCompletedTitle
    : "No units completed yet.";

  const lastCompletedChapterDisplay = lastCompletedTitle
    ? lastCompletedChapterTitle
    : "";

  // 10. Handle when all units are completed
  const allUnitsCompleted = progressPercentage === 100;

  return (
    <main className="pl-48 flex flex-col justify-center space-y-20 min-h-screen min-w-full bg-cover bg-opacity-35 text-white">
      <div
        className="
          pl-56
          w-[120vw]
          h-[120vh]
          absolute
          inset-0
          bg-cover
          bg-center
          opacity-25
          pointer-events-none
          transition-all
          duration-100
          -z-10
        "
        style={{
          backgroundImage: foundNextUnit
            ? `url('${courseData[nextSemesterIndex].chapters[nextChapterIndex].backgroundImage}')`
            : `url('${courseData[courseData.length - 1].chapters[courseData[courseData.length - 1].chapters.length - 1].backgroundImage}')`,
        }}
      />
      {/* 2. Use the DashboardContent client component */}
      <DashboardContent
        nextUnitTitle={nextUnitTitle}
        nextUnitChapterTitle={nextUnitChapterTitle}
        resumeCourseLink={resumeCourseLink}
        allUnitsCompleted={allUnitsCompleted}
        progressPercentage={progressPercentage}
        lastCompletedUnitDisplay={lastCompletedUnitDisplay}
        lastCompletedChapterDisplay={lastCompletedChapterDisplay}
      />
           {isAdmin && (
        <div className="text-right pr-8">
          <a
            href="/adminDashboard"
            className="fixed bottom-8 right-10 px-4 py-2 text-white rounded hover:bg-secondary-foreground transition-colors"
          >
            Admin Dashboard
          </a>
        </div>
      )}
    </main>
  );
}
