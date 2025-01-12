// src/utils/typeGuards.ts

import { CompletedUnits } from "@/types/course"; // Adjust as necessary

export function isCompletedUnits(data: any): data is CompletedUnits {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return false;
  }

  return Object.entries(data).every(([key, value]) => {
    return (
      typeof key === "string" &&
      Array.isArray(value) &&
      value.every((unitId) => typeof unitId === "string")
    );
  });
}
