import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { entityType, entityId, managerIds } = body;

    if (!entityType || !entityId || !managerIds) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate entity type
    if (!["group", "region", "diocese"].includes(entityType)) {
      return NextResponse.json(
        { error: "Invalid entity type" },
        { status: 400 }
      );
    }

    // Validate managerIds is an array
    if (!Array.isArray(managerIds)) {
      return NextResponse.json(
        { error: "managerIds must be an array" },
        { status: 400 }
      );
    }

    // Verify all managers exist
    const existingManagers = await prisma.user.findMany({
      where: {
        id: {
          in: managerIds
        }
      },
      select: {
        id: true
      }
    });

    if (existingManagers.length !== managerIds.length) {
      return NextResponse.json(
        { error: "One or more managers do not exist" },
        { status: 400 }
      );
    }

    // Update managers based on entity type
    let result;
    try {
      switch (entityType) {
        case "group":
          result = await prisma.group.update({
            where: { id: entityId },
            data: {
              managers: {
                set: managerIds.map((id: string) => ({ id }))
              }
            },
            include: {
              managers: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          });
          break;

        case "region":
          result = await prisma.region.update({
            where: { id: entityId },
            data: {
              managers: {
                set: managerIds.map((id: string) => ({ id }))
              }
            },
            include: {
              managers: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          });
          break;

        case "diocese":
          result = await prisma.diocese.update({
            where: { id: entityId },
            data: {
              managers: {
                set: managerIds.map((id: string) => ({ id }))
              }
            },
            include: {
              managers: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          });
          break;
      }
    } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update entity managers. The entity may not exist." },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating managers:", error);
    return NextResponse.json(
      { error: "Failed to update managers" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (!role) {
      return NextResponse.json(
        { error: "Role parameter is required" },
        { status: 400 }
      );
    }

    // Fetch users with the specified role
    const users = await prisma.user.findMany({
      where: {
        role: role as any
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching managers:", error);
    return NextResponse.json(
      { error: "Failed to fetch managers" },
      { status: 500 }
    );
  }
} 