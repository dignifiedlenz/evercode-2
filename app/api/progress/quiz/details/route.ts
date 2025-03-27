import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received request body:", body);

    const { questionId, unitId, chapterId, attempts, completedAt, incorrectAnswers } = body;

    // Validate required fields
    if (!questionId || !unitId || !chapterId) {
      console.error("Missing required fields:", { questionId, unitId, chapterId });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get or create UserProgress
    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId: session.user.id
      },
      create: {
        userId: session.user.id
      },
      update: {}
    });

    console.log("Processing request with data:", {
      userId: session.user.id,
      questionId,
      unitId,
      chapterId,
      attempts,
      completedAt,
      incorrectAnswers,
      progressId: userProgress.id
    });

    // Update or create quiz progress details
    try {
      const progress = await prisma.quizProgressDetails.upsert({
        where: {
          userId_questionId: {
            userId: session.user.id,
            questionId
          }
        },
        update: {
          attempts: attempts || 0,
          completedAt: completedAt ? new Date(completedAt) : null,
          incorrectAnswers: incorrectAnswers || [],
          updatedAt: new Date(),
          progressId: userProgress.id
        },
        create: {
          userId: session.user.id,
          questionId,
          unitId,
          chapterId,
          attempts: attempts || 0,
          completedAt: completedAt ? new Date(completedAt) : null,
          incorrectAnswers: incorrectAnswers || [],
          progressId: userProgress.id
        }
      });

      console.log("Successfully saved progress:", progress);
      return NextResponse.json(progress);
    } catch (error) {
      console.error("Error saving QuizProgressDetails:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Top-level error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: "Failed to save quiz progress details", 
          details: error.message,
          stack: error.stack
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save quiz progress details", details: "Unknown error" },
      { status: 500 }
    );
  }
} 