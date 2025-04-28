import { prisma } from "@/lib/prisma";
import RegionDashboardClient from "./RegionDashboardClient";

export default async function RegionDashboard({ params }: { params: { id: string } }) {
  try {
    // Fetch region data with all related information
    const region = await prisma.region.findUnique({
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
    });

    if (!region) {
      return <div>Region not found</div>;
    }

    return <RegionDashboardClient region={region} />;
  } catch (error) {
    console.error("Error fetching region data:", error);
    return <div>Error loading region data</div>;
  }
} 