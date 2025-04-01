import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch all groups with their users and progress statistics
    const groups = await prisma.group.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            progress: {
              select: {
                unitProgress: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate statistics for each group
    const groupsWithStats = groups.map(group => {
      const totalUsers = group.users.length;
      const usersWithProgress = group.users.filter(user => user.progress?.unitProgress?.length > 0).length;
      const averageProgress = totalUsers > 0 
        ? group.users.reduce((acc, user) => {
            const progress = user.progress?.unitProgress || [];
            return acc + (progress.length / 20); // Assuming 20 total units
          }, 0) / totalUsers
        : 0;

      return {
        ...group,
        statistics: {
          totalUsers,
          usersWithProgress,
          averageProgress: Math.round(averageProgress * 100),
        },
      };
    });

    return NextResponse.json(groupsWithStats);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        name,
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return new NextResponse("Group ID is required", { status: 400 });
    }

    // First, update all users in the group to remove their group association
    await prisma.user.updateMany({
      where: {
        groupId,
      },
      data: {
        groupId: null,
      },
    });

    // Then delete the group
    await prisma.group.delete({
      where: {
        id: groupId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting group:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 