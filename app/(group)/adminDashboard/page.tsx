// src/app/admin-dashboard/page.tsx

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/DataTable";
import courseData from "../../_components/(semester1)/courseData";

interface UserData {
  name: string;
  email: string;
  progress: number;
}

export default async function AdminDashboardPage() {
  // Fetch the session on the server
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated
  if (!session?.user?.email) {
    redirect("/signin");
  }

  // Fetch user from database
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { group: true },
  });

  // Redirect if user not found or not admin
  if (!dbUser || dbUser.role !== "admin") {
    redirect("/"); // Redirect non-admin users
  }

  const groupId = dbUser.groupId;

  // Fetch all users in the same group
  const users = await prisma.user.findMany({
    where: { groupId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      completedUnits: true, // Ensure this field is fetched
    },
  });

  // Calculate total units
  const totalUnits = courseData.reduce(
    (acc, semester) =>
      acc +
      semester.chapters.reduce(
        (chapAcc, chap) => chapAcc + chap.units.length,
        0
      ),
    0
  );

  // Map users to table data
  const userData: UserData[] = users.map((user) => {
    const completedUnits = user.completedUnits
      ? Object.values(user.completedUnits).flat().length
      : 0;
    const progress =
      totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

    return {
      name:
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        "Unnamed User",
      email: user.email,
      progress,
    };
  });

  // Optional: Add console logs for debugging
  console.log("Fetched Users:", users);
  console.log("User Data for Table:", userData);

  return (
    <main className="w-screen h-screen">
      <div
        className="
          pl-56
          w-[120vw]
          h-[120vh]
          absolute
          inset-0
          bg-cover
          bg-center
          opacity-25
          pointer-events-none
          transition-all
          duration-100
          -z-10
        "
        style={{
          backgroundImage: `url('/503698ldsdl.jpg')`,
        }}
      />
      {/* Fixed Admin Dashboard Title */}
      <p className="fixed pl-28 top-6 pt-2 font-custom1 text-5xl text-white">
        Admin Dashboard
      </p>

      {/* Centered Data Table Container */}
      <div className="flex items-center justify-center h-full p-4">
        <div className="
          w-full h-full
          sm:w-[80vw] sm:h-[70vh]
          md:w-[70vw] md:h-[65vh]
          lg:w-[60vw] lg:h-[60vh]
          bg-opacity-90 rounded-lg shadow-lg overflow-auto p-4
        ">
          <DataTable data={userData} />
        </div>
      </div>
    </main>
  );
}
