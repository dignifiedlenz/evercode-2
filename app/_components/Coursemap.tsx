// src/app/course/CourseMap.tsx

"use client";

import React, { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import courseData from "./(semester1)/courseData";
import { useProgress } from "@/context/ProgressContext"; // Progress tracking context
import Link from "next/link";
import { Unit, Semester, Chapter } from "@/types/course"; // Import interfaces
import { FaArrowLeft } from "react-icons/fa"; // Icon for indicator

export function CourseMap() {
  const { completedUnits } = useProgress();

  // Flatten the courseData to an ordered list of units
  const orderedUnits = useMemo(() => {
    const units: { chapterId: string; unit: Unit }[] = [];
    courseData.forEach((semester: Semester) => {
      semester.chapters.forEach((chapter: Chapter) => {
        chapter.units.forEach((unit: Unit) => {
          units.push({ chapterId: chapter.id, unit });
        });
      });
    });
    return units;
  }, []);

  // Find the next unit to complete
  const nextUnit = useMemo(() => {
    return orderedUnits.find(({ chapterId, unit }) => {
      return !(completedUnits[chapterId]?.includes(unit.id));
    });
  }, [orderedUnits, completedUnits]);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full text-white text-2xl font-custom2"
    >
      {courseData.map((semester: Semester) =>
        semester.chapters.map((chapter: Chapter) => (
          <AccordionItem key={chapter.id} value={chapter.id}>
            <AccordionTrigger>
              <p>{chapter.title}</p>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="pl-5">
                {chapter.units.map((unit: Unit) => {
                  const isCompleted =
                    completedUnits[chapter.id]?.includes(unit.id);
                  const isNextUnit =
                    nextUnit?.chapterId === chapter.id &&
                    nextUnit.unit.id === unit.id;
                  const isClickable = isCompleted || isNextUnit;

                  return (
                    <li key={unit.id} className="py-1 flex items-center">
                      {isClickable ? (
                        <Link
                          href={`/course?session=${unit.id}`}
                          className={`flex items-start justify-between w-full text-lg tracking-wide hover:text-secondary-foreground hover:pl-5 transition-all duration-300 ${
                            isCompleted
                              ? "text-white"
                              : "text-zinc-200 font-semibold"
                          }`}
                        >
                          {unit.title}
                          {isNextUnit && (
                            <FaArrowLeft className="ml-2 text-secondary text-lg" />
                            // Alternatively, use an emoji: <span className="ml-2">➡️</span>
                          )}
                        </Link>
                      ) : (
                        <span className="flex items-center text-lg tracking-wide text-gray-500 cursor-not-allowed">
                          {unit.title}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))
      )}
    </Accordion>
  );
}
