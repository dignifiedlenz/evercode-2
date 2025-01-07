
// app/page.tsx (Server Component by default in Next.js 13)

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import course1Data from "../_components/(semester1)/course1Data";
import { Progress } from "@/components/ui/progress";



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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    redirect("/signup");
  }

  
  // 3. Logic for next session
  // If dbUser.lastCompletedSession = 2, next session is 3, etc.
  // You can clamp it so it doesn't exceed the total course length
  const nextSessionIndex = (dbUser.lastCompletedSession ?? 0);

  const lastIndex = user.lastCompletedSession ?? 0;

  let lastTitle = "";
  if (lastIndex < course1Data.length) {
    lastTitle = course1Data[lastIndex].title; 
  } else {
    // That means they've completed all sessions in courseData
    lastTitle = "All sessions completed in Course 1!";
  }


  const totalSections = course1Data.length;
  const completedSections = user.lastCompletedSession ?? 0;
  const progressPercentage =
    ((completedSections) / totalSections) * 100; // +1 to include the current section


  
  // We'll pass nextSessionIndex to a button or link
  // that sends them to `/course?session=${nextSessionIndex}`
  return (
    
    <main className="grid grid-cols-2 grid-rows-2 space-x-4 p-10 min-h-screen min-w-full bg-cover bg-opacity-35 text-white">
      <div
        className="
          pl-56
          w-[120vw]
          h-[120vh]
          absolute
          inset-0
          bg-auto
          bg-center
          opacity-25
          pointer-events-none
          transition-all
          duration-100
          -z-10
        "
        style={{
          backgroundImage: `url('/310282rg.jpg')`,
        }}
      />
      <div className="w-[50%] h-96  px-10 py-8">
        <h1 className="text-6xl font-custom1 "> Welcome Back {user.firstName ? user.firstName : "to the Course"}!</h1>
        <p className="mt-10 font-custom2">Your next video is waiting for you: 
        </p>
      
        <p className="text-3xl font-custom1 mb-10">
        <strong>{lastTitle}</strong>
        </p>
        <a
          href={`/course?session=${nextSessionIndex}`}
          className="bg-secondary hover:bg-secondary-foreground text-black my-10 px-4 py-4 rounded hover:px-7 transition-all"
        >
          Resume Course
        </a>
      </div>
      <div className="flex flex-col w-[50%] h-96 border border-zinc-700 rounded-xl px-10 py-8">
        
        <Link
          href="/profile"
          className="w-fit bg-secondary hover:bg-secondary-foreground text-black my-10 px-4 py-4 rounded hover:px-7 transition-all"
          >
          Edit Profile
        </Link>
        <Link
          href="/profile"
          className="w-fit bg-secondary hover:bg-secondary-foreground text-black my-10 px-4 py-4 rounded hover:px-7 transition-all"
          >
          Contact Support
        </Link>
      </div>
      <div className="flex flex-col w-[50%] h-96 border border-zinc-700 rounded-xl px-10 py-8">
        
       {/* Progress bar */}
        <div className="w-3/4 max-w-lg">
          <p className="font-custom1 text-white text-3xl">Your Progress in Semester 3</p>
          <Progress value={progressPercentage} className="mt-3 h-2 [&>div]:bg-secondary-foreground bg-white" />
          <p className="text-sm mt-2">{progressPercentage.toFixed(0)}% Complete</p>
        </div>
      </div>
      <div className="flex flex-col w-[50%] h-96 border border-zinc-700 rounded-xl px-10 py-8">
        
        

       </div>

      
      
    </main>
  );
}
