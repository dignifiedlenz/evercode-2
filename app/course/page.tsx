// app/course/page.tsx
import { redirect } from "next/navigation";
import courseData from "@/app/_components/(semester1)/courseData";

export default function CoursePage() {
  // Redirect to the first available semester
  const firstSemesterId = courseData[0]?.id || "semester-1";
  redirect(`/course/${firstSemesterId}`);
  
  // This return is never reached but required for TypeScript
  return null;
}
