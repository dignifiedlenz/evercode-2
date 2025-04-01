import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete all progress records for the user
    await prisma.progress.deleteMany({
      where: { userId: params.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting progress:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 