// src/app/course/CourseMenu.tsx

"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import courseData from "@/app/_components/(semester1)/courseData";
import { Chapter } from "@/types/course";

// Define the shape of a menu item
interface MenuItemProps {
  chapter: Chapter;
  isCurrent: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ chapter, isCurrent }) => {
  return (
    <li className="menu__item">
      <Link
        href={`/course?session=${chapter.units[0]?.id}`} // Link to the first unit of the chapter
        className={`js-menu-item ${isCurrent ? "is-current" : ""}`}
        style={{
          opacity: isCurrent ? 1 : 0,
          backfaceVisibility: "visible",
          zIndex: 0,
          transform: `matrix(1, 0, 0, 1, ${isCurrent ? "-20" : "20"}, 0)`,
        }}
      >
        <span className="menu__label">Chapter {chapter.id.split("-")[1]}</span>
        <span className="menu__chapter">{chapter.title}</span>
      </Link>
      <span className="menu__dot js-menu-dot"></span>
    </li>
  );
};

const CourseMenu: React.FC = () => {
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");

  // Determine the current chapter based on the sessionParam
  const currentChapterId = React.useMemo(() => {
    for (const semester of courseData) {
      for (const chapter of semester.chapters) {
        for (const unit of chapter.units) {
          if (unit.id === sessionParam) {
            return chapter.id;
          }
        }
      }
    }
    return null;
  }, [sessionParam]);

  return (
    <ul className="menu__list">
      {courseData.map((semester) =>
        semester.chapters.map((chapter) => {
          const isCurrent = chapter.id === currentChapterId;
          return (
            <MenuItem
              key={chapter.id}
              chapter={chapter}
              isCurrent={isCurrent}
            />
          );
        })
      )}
    </ul>
  );
};

export default CourseMenu;
