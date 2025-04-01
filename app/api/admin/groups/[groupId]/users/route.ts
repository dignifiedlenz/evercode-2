import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Update the user to add them to the group
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        groupId: params.groupId,
      },
      include: {
        group: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error adding user to group:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Update the user to remove them from the group
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        groupId: null,
      },
      include: {
        group: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error removing user from group:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 