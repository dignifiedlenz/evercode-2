import { prisma } from "@/lib/prisma";
import GroupDashboardClient from "./GroupDashboardClient";

export default async function GroupDashboard(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Fetch group data with all related information
    const group = await prisma.group.findUnique({
      where: {
        id: params.id,
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
        region: {
          include: {
            managers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            },
            diocese: {
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
            }
          }
        },
        users: {
          orderBy: {
            firstName: 'asc'
          }
        }
      }
    });

    if (!group) {
      return <div>Group not found</div>;
    }

    return <GroupDashboardClient group={group} />;
  } catch (error) {
    console.error("Error fetching group data:", error);
    return <div>Error loading group data</div>;
  }
} 