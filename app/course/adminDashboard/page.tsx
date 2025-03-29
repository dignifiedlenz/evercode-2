// src/app/admin-dashboard/page.tsx

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/DataTable";
import courseData from "../../_components/(semester1)/courseData";
import { Metadata } from "next";

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

export default async function AdminDashboardPage() {
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
  const groupId = dbUser.groupId;
  const group = dbUser.group?.name || "Default Group";

  // Fetch all users in the admin's group with detailed data
  const users = await prisma.user.findMany({
    where: { groupId },
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

  // Calculate totals for progress tracking
  const totalUnits = courseData.reduce(
    (acc, semester) => acc + semester.chapters.reduce(
      (chapAcc, chap) => chapAcc + chap.units.length, 0
    ), 0
  );

  // Format user data for display
  const userData: UserData[] = users.map((user) => {
    // Calculate completed units from progress data
    const completedUnits = user.progress?.unitProgress.reduce((acc, progress) => {
      if (progress.questionsCompleted && progress.videoCompleted) {
        return acc + 1;
      }
      return acc;
    }, 0) || 0;
    
    const progress = totalUnits > 0 
      ? Math.round((completedUnits / totalUnits) * 100) 
      : 0;

    // Format name with fallback
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    
    return {
      name: fullName || "Unnamed Student",
      email: user.email,
      progress,
    };
  });

  // Calculate group stats
  const totalStudents = userData.length;
  const avgProgress = userData.length > 0
    ? Math.round(userData.reduce((acc, user) => acc + user.progress, 0) / userData.length)
    : 0;
  const activeStudents = userData.filter(user => user.progress > 0).length;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-70 -z-10" />
      
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-20 -z-20"
        style={{ backgroundImage: `url('/503698ldsdl.jpg')` }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <header className="mb-12 pt-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">
            Manage and monitor student progress in <span className="text-secondary">{group}</span>
          </p>
        </header>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-black/40 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Students</h3>
            <p className="text-3xl font-bold text-white">{totalStudents}</p>
          </div>
          
          <div className="bg-black/40 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Average Progress</h3>
            <p className="text-3xl font-bold text-secondary">{avgProgress}%</p>
          </div>
          
          <div className="bg-black/40 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Active Students</h3>
            <p className="text-3xl font-bold text-white">
              {activeStudents} <span className="text-gray-500 text-sm font-normal">({Math.round(activeStudents/totalStudents*100)}%)</span>
            </p>
          </div>
        </div>

        {/* Student Progress Table */}
        <section className="mb-8">
          <DataTable data={userData} />
        </section>
      </div>
    </main>
  );
}
