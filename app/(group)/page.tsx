// app/page.tsx (Server Component by default in Next.js 13)
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  // 1. Check session server-side
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    // If not signed in, redirect
    redirect("/signin");
  }

  // 2. Fetch user from DB
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!dbUser) {
    // If no user found, sign out or handle error
    // For now, redirect to signup
    redirect("/signup");
  }

  // 3. Logic for next session
  // If dbUser.lastCompletedSession = 2, next session is 3, etc.
  // You can clamp it so it doesn't exceed the total course length
  const nextSessionIndex = (dbUser.lastCompletedSession ?? 0);

  // We'll pass nextSessionIndex to a button or link
  // that sends them to `/course?session=${nextSessionIndex}`
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-2xl mb-6">Welcome to Your Dashboard</h1>
      <p className="mb-4">Last Completed Session: {dbUser.lastCompletedSession}</p>
      <a
        href={`/course?session=${nextSessionIndex}`}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Resume Course
      </a>
    </main>
  );
}
