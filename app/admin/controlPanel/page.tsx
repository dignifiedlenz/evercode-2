import { prisma } from "@/lib/prisma";
import ControlPanelClient from "./ControlPanelClient";
import { Prisma, UserRole } from "@prisma/client";

export default async function ControlPanel() {
  // Fetch initial data with error handling
  try {
    // Fetch users with their group
    const users = await prisma.user.findMany({
      include: {
        group: true
      }
    });
    
    // Fetch groups with their managers and users
    const groups = await prisma.group.findMany({
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
    });
    
    // Fetch regions with their managers and groups
    const regions = await prisma.region.findMany({
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
    });
    
    // Fetch dioceses with their managers and regions
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

    // Transform data to match our interfaces
    const typedUsers = users.map(user => ({
      id: user.id,
      auth_id: user.auth_id,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
      groupId: user.groupId,
      group: user.group ? {
        id: user.group.id,
        name: user.group.name,
        regionId: user.group.regionId
      } : undefined
    }));
    
    const typedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      regionId: group.regionId,
      managers: group.managers.map(manager => ({
        id: manager.id,
        firstName: manager.firstName || "",
        lastName: manager.lastName || "",
        email: manager.email
      })),
      users: group.users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.role
      })),
      statistics: {
        totalUsers: group.users.length,
        usersWithProgress: group.users.filter(user => user.role !== UserRole.USER).length,
        averageProgress: group.users.length > 0 
          ? ((group.users.filter(user => user.role !== UserRole.USER).length / group.users.length) * 100)
          : 0
      }
    }));
    
    const typedRegions = regions.map(region => ({
      id: region.id,
      name: region.name,
      dioceseId: region.dioceseId,
      managers: region.managers.map(manager => ({
        id: manager.id,
        firstName: manager.firstName || "",
        lastName: manager.lastName || "",
        email: manager.email
      })),
      groups: region.groups.map(group => ({
        id: group.id,
        name: group.name,
        regionId: group.regionId,
        managers: group.managers.map(manager => ({
          id: manager.id,
          firstName: manager.firstName || "",
          lastName: manager.lastName || "",
          email: manager.email
        })),
        users: group.users.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          role: user.role
        })),
        statistics: {
          totalUsers: group.users.length,
          usersWithProgress: group.users.filter(user => user.role !== UserRole.USER).length,
          averageProgress: group.users.length > 0 
            ? ((group.users.filter(user => user.role !== UserRole.USER).length / group.users.length) * 100)
            : 0
        }
      }))
    }));
    
    const typedDioceses = dioceses.map(diocese => ({
      id: diocese.id,
      name: diocese.name,
      managers: diocese.managers.map(manager => ({
        id: manager.id,
        firstName: manager.firstName || "",
        lastName: manager.lastName || "",
        email: manager.email
      })),
      regions: diocese.regions.map(region => ({
        id: region.id,
        name: region.name,
        dioceseId: region.dioceseId,
        managers: region.managers.map(manager => ({
          id: manager.id,
          firstName: manager.firstName || "",
          lastName: manager.lastName || "",
          email: manager.email
        })),
        groups: region.groups.map(group => ({
          id: group.id,
          name: group.name,
          regionId: group.regionId,
          managers: group.managers.map(manager => ({
            id: manager.id,
            firstName: manager.firstName || "",
            lastName: manager.lastName || "",
            email: manager.email
          })),
          users: group.users.map(user => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            role: user.role
          })),
          statistics: {
            totalUsers: group.users.length,
            usersWithProgress: group.users.filter(user => user.role !== UserRole.USER).length,
            averageProgress: group.users.length > 0 
              ? ((group.users.filter(user => user.role !== UserRole.USER).length / group.users.length) * 100)
              : 0
          }
        }))
      }))
    }));
  
    return (
      <ControlPanelClient
        initialUsers={typedUsers}
        initialGroups={typedGroups}
        initialRegions={typedRegions}
        initialDioceses={typedDioceses}
      />
    );
  } catch (error) {
    console.error("Error in control panel data fetching:", error);
    return (
      <ControlPanelClient
        initialUsers={[]}
        initialGroups={[]}
        initialRegions={[]}
        initialDioceses={[]}
      />
    );
  }
} 