// app/course/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import courseData from "@/app/_components/(semester1)/courseData";
import CourseClientComponent from "./CourseClientComponent";
import { Semester, Chapter, Unit } from "@/types/course";

// Define the FoundUnit interface
interface FoundUnit {
  semester: Semester;
  chapter: Chapter;
  unit: Unit;
}

const CoursePage: React.FC = () => {
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");

  const [foundUnit, setFoundUnit] = useState<FoundUnit | null>(null);

  // Fetch and set the current unit based on sessionParam
  useEffect(() => {
    console.log("Session Param:", sessionParam); // Debugging

    const sessionId = sessionParam;

    if (!sessionId) {
      // If no session is specified, navigate to the first unit or handle as desired
      const firstUnit = courseData[0]?.chapters[0]?.units[0];
      if (firstUnit) {
        console.log("Redirecting to first unit:", firstUnit.id); // Debugging
        window.location.href = `/course?session=${firstUnit.id}`;
      } else {
        // Handle case where courseData is empty
        console.error("No units available in courseData.");
      }
      return;
    }

    // Find the unit in courseData
    let found: FoundUnit | null = null;

    for (const semester of courseData) {
      for (const chapter of semester.chapters) {
        for (const unit of chapter.units) {
          if (unit.id === sessionId) {
            found = { semester, chapter, unit };
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }

    if (found) {
      console.log("Found Unit:", found); // Debugging
      setFoundUnit(found);
    } else {
      // If unit not found, redirect to first unit or show a 404
      console.error(`Unit with id ${sessionId} not found.`);
      window.location.href = `/course`; // Or implement a 404 page
    }
  }, [sessionParam]);

  if (!foundUnit) {
    return <p className="text-white">Loading...</p>;
  }

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="w-3/4">
        <CourseClientComponent />
      </div>
    </div>
  );
};

export default CoursePage;
