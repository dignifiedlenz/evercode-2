
// app/layout.tsx or src/components/GroupLayout.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust the import path as needed
import { prisma } from "@/lib/prisma"; // Adjust the import path as needed
import courseData from "../_components/(semester1)/courseData"; // Adjust the import path as needed
import Sidebar from "../_components/sidebar";
import UserMenu from "../_components/UserMenu"; // Adjust the import path as needed


// Define the type for CompletedUnits if not already defined
interface CompletedUnits {
  [chapterId: string]: string[];
}

const GroupLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // 1. Retrieve the user session
  const session = await getServerSession(authOptions);

  // 2. Redirect if no session (optional)
  if (!session?.user?.email) {
    // Implement your redirect logic here
    // For example, you might throw a redirect
    // throw redirect("/signin");
  }

  // 3. Fetch the user from the database
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" },
  });

  // 4. Extract completedUnits, ensuring it's not undefined
  const completedUnits: CompletedUnits = (dbUser?.completedUnits as CompletedUnits) || {};


  return (
    <div className="w-screen h-screen flex flex-row">
      {/* Sidebar */}
      <div className="fixed z-50">
        <Sidebar courseData={courseData} completedUnits={completedUnits} />
      </div>

      {/* User Menu */}
      <div className="fixed z-50 top-5 right-5">
        <UserMenu />
      </div>

      {/* Main Content */}
      <div className="h-full w-full flex flex-col items-center font-custom2">
        {children}
      </div>
    </div>
  );
};

export default GroupLayout;
