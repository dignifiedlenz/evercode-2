import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { unitProgress } = await request.json();

    if (!unitProgress) {
      return NextResponse.json({ error: "Unit progress is required" }, { status: 400 });
    }

    const { userId } = await params;

    // Update the user's progress
    const updatedProgress = await prisma.userProgress.upsert({
      where: {
        userId,
      },
      update: {
        unitProgress,
      },
      create: {
        userId,
        unitProgress,
      },
    });

    return NextResponse.json(updatedProgress || { unitProgress: [] });
  } catch (error) {
    console.error("Error updating user progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    // Get the user's current progress
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId,
      },
    });

    return NextResponse.json(progress || { unitProgress: [] });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 