import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { courseData } from "@/app/_components/(semester1)/courseData";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Transform the course data to include all necessary information
    const transformedData = {
      semesters: courseData.map((semester) => ({
        id: semester.id,
        title: semester.title,
        description: semester.description,
        backgroundImage: semester.backgroundImage,
        chapters: semester.chapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          backgroundImage: chapter.backgroundImage,
          units: chapter.units.map((unit) => ({
            id: unit.id,
            title: unit.title,
            video: unit.video,
          })),
        })),
      })),
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching course data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 