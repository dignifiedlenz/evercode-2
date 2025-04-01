// src/app/admin-dashboard/page.tsx

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/DataTable";
import { Metadata } from "next";
import { ColumnDef } from "@tanstack/react-table";

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Admin Dashboard | Course Management',
  description: 'Admin dashboard for monitoring student progress'
};

// Refined interface for user data
interface UserData {
  name: string;
  email: string;
  progress: number;
}

// Define columns for the DataTable
const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const progress = row.original.progress;
      return (
        <div className="flex items-center justify-end gap-2">
          <div className="w-32 bg-gray-800 rounded-full h-2">
            <div 
              className="bg-secondary h-2 rounded-full" 
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <span className="text-secondary">{progress}%</span>
        </div>
      );
    },
  },
];

export default async function AdminDashboard() {
  // Authentication checks
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/signin");
  }

  // Fetch admin user details
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { group: true },
  });

  // Ensure user is authorized as admin
  if (!dbUser || dbUser.role !== "admin") {
    redirect("/course/semester-1"); // Redirect to main course page if not admin
  }

  // Get the group for the admin
  const groupName = dbUser.group?.name || "Default Group";

  // Fetch all users in the admin's group with detailed data
  const users = await prisma.user.findMany({
    where: { groupId: dbUser.groupId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      progress: {
        include: {
          unitProgress: true
        }
      }
    },
    orderBy: {
      lastName: 'asc'
    }
  });

  // Transform the data to include completed units
  const usersWithProgress = users.map(user => {
    const completedUnits = user.progress?.unitProgress.reduce((acc, progress) => {
      if (progress.questionsCompleted && progress.videoCompleted) {
        if (!acc[progress.chapterId]) {
          acc[progress.chapterId] = [];
        }
        acc[progress.chapterId].push(progress.unitId);
      }
      return acc;
    }, {} as Record<string, string[]>) || {};

    return {
      ...user,
      completedUnits
    };
  });

  // Format user data for the DataTable
  const userData = usersWithProgress.map((user) => {
    const totalUnits = Object.values(user.completedUnits).flat().length;
    // Use a fixed calculation to ensure consistency
    const progress = Math.floor((totalUnits / 20) * 100);
    
    return {
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed Student',
      email: user.email,
      progress
    };
  });

  // Calculate stats with consistent rounding
  const totalStudents = usersWithProgress.length;
  const activeStudents = usersWithProgress.filter(user => Object.keys(user.completedUnits).length > 0).length;
  const avgProgress = Math.floor(
    usersWithProgress.reduce((acc, user) => {
      const totalUnits = Object.values(user.completedUnits).flat().length;
      return acc + totalUnits;
    }, 0) / totalStudents
  );

  return (
    <div className="relative min-h-screen text-white font-morion w-full">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/90 opacity-70 -z-10" />
      
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-20 -z-20"
        style={{ backgroundImage: `url('/503698ldsdl.jpg')` }}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Dashboard Header */}
        <header className="mb-12 pt-8 text-center">
          <h1 className="text-5xl font-bold mb-2 font-neima">Admin Dashboard</h1>
          <p className="text-gray-400 font-morion">
            Manage and monitor student progress in <span className="text-secondary">{groupName}</span>
          </p>
        </header>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-black/40 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1 font-morion">Total Students</h3>
            <p className="text-3xl font-bold text-white font-neima">{totalStudents}</p>
          </div>
          
          <div className="bg-black/40 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1 font-morion">Average Progress</h3>
            <p className="text-3xl font-bold text-secondary font-neima">{avgProgress}%</p>
          </div>
          
          <div className="bg-black/40 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1 font-morion">Active Students</h3>
            <p className="text-3xl font-bold text-white font-neima">
              {activeStudents} <span className="text-gray-200 text-sm font-morion">({Math.floor(activeStudents/totalStudents*100)}%)</span>
            </p>
          </div>
        </div>

        {/* Student Progress Table Section */}
        <section className="mb-8">
          <div className="custom-scrollbar">
            <DataTable data={userData} />
          </div>
        </section>
      </div>
    </div>
  );
}
