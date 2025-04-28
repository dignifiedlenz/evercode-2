import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Fetching dioceses from database...");
    const dioceses = await prisma.diocese.findMany({
      include: {
        managers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        regions: {
          include: {
            managers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            },
            groups: {
              include: {
                managers: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  }
                },
                users: true
              }
            }
          }
        }
      }
    });
    console.log("Fetched dioceses:", dioceses);
    return NextResponse.json(dioceses);
  } catch (error) {
    console.error("Error fetching dioceses:", error);
    return NextResponse.json({ error: "Failed to fetch dioceses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, managerIds } = body;

    if (!name || !managerIds || !Array.isArray(managerIds)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const diocese = await prisma.diocese.create({
      data: {
        name,
        managers: {
          connect: managerIds.map(id => ({ id }))
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
        },
        regions: {
          include: {
            managers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            },
            groups: {
              include: {
                managers: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  }
                },
                users: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(diocese);
  } catch (error) {
    console.error("Error creating diocese:", error);
    return NextResponse.json(
      { error: "Failed to create diocese" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, managerIds } = body;

    if (!id || !name || !managerIds || !Array.isArray(managerIds)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const diocese = await prisma.diocese.update({
      where: { id },
      data: {
        name,
        managers: {
          set: managerIds.map(id => ({ id }))
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
        },
        regions: {
          include: {
            managers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            },
            groups: {
              include: {
                managers: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  }
                },
                users: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(diocese);
  } catch (error) {
    console.error("Error updating diocese:", error);
    return NextResponse.json(
      { error: "Failed to update diocese" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Diocese ID is required" },
        { status: 400 }
      );
    }

    await prisma.diocese.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting diocese:", error);
    return NextResponse.json(
      { error: "Failed to delete diocese" },
      { status: 500 }
    );
  }
} 