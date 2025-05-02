import { prisma } from "@/lib/prisma";
import DioceseDashboardClient from "./DioceseDashboardClient";

export default async function DioceseDashboard(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Fetch diocese data with all related information
    const diocese = await prisma.diocese.findUnique({
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

    if (!diocese) {
      return <div>Diocese not found</div>;
    }

    return <DioceseDashboardClient diocese={diocese} />;
  } catch (error) {
    console.error("Error fetching diocese data:", error);
    return <div>Error loading diocese data</div>;
  }
} 