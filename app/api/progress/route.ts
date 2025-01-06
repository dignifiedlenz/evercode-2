// app/api/progress/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // your NextAuth config

export async function POST(request: Request) {
  try {
    // 1. Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the body
    const { newSessionIndex } = await request.json();
    if (typeof newSessionIndex !== "number") {
      return NextResponse.json({ error: "Invalid session index" }, { status: 400 });
    }

    // 3. Update user's progress in the DB
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        lastCompletedSession: newSessionIndex,
      },
    });

    return NextResponse.json({ message: "Progress updated", updatedUser });
  } catch (error) {
    console.error("UPDATE_PROGRESS_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
