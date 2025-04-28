import { courseData } from '@/app/_components/(semester1)/courseData';

// Type definitions
type UnitMapping = {
  semesterId: string;
  chapterId: string;
};

type CourseMapping = {
  [unitId: string]: UnitMapping;
};

// Build a mapping of unit IDs to their semester and chapter context
export const buildCourseMapping = (): CourseMapping => {
  const mapping: CourseMapping = {};
  
  courseData.forEach(semester => {
    semester.chapters.forEach(chapter => {
      chapter.units.forEach(unit => {
        mapping[unit.id] = {
          semesterId: semester.id,
          chapterId: chapter.id
        };
      });
    });
  });
  
  return mapping;
};

// Create a static mapping that can be imported and used
export const courseMapping = buildCourseMapping();

// Helper function to check if a unit belongs to a specific semester
export const isUnitInSemester = (unitId: string, semesterId: string): boolean => {
  return courseMapping[unitId]?.semesterId === semesterId;
};

// Helper function to get all units for a semester
export const getUnitsForSemester = (semesterId: string): string[] => {
  return Object.entries(courseMapping)
    .filter(([_, context]) => context.semesterId === semesterId)
    .map(([unitId, _]) => unitId);
};

// Helper function to get all units for a chapter
export const getUnitsForChapter = (chapterId: string): string[] => {
  return Object.entries(courseMapping)
    .filter(([_, context]) => context.chapterId === chapterId)
    .map(([unitId, _]) => unitId);
}; 