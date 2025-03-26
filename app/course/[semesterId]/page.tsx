"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import DashboardContent from "../../_components/DashboardContent";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CompletedUnits } from "@/types/course";
import courseData from "../../_components/(semester1)/courseData";
import PageTransitionWrapper from "../../_components/PageTransitionWrapper";

interface PageProps {
  params: Promise<{
    semesterId: string;
  }>;
}

export default function SemesterPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [completedUnits, setCompletedUnits] = useState<CompletedUnits>({});
  const [firstName, setFirstName] = useState("");

  // Extract semester number from the ID (e.g., "semester-1" -> 1)
  const semesterNumber = parseInt(resolvedParams.semesterId.split("-")[1]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (session?.user) {
      // Set the first name from the session
      setFirstName(session.user.name?.split(' ')[0] || "");

      // Fetch progress data
      fetch("/api/progress")
        .then((res) => res.json())
        .then((data) => {
          if (data.progress) {
            setProgress(data.progress);
          }
          if (data.completedUnits) {
            setCompletedUnits(data.completedUnits);
          }
        })
        .catch((error) => {
          console.error("Error fetching progress:", error);
        });
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white font-morion">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <PageTransitionWrapper>
      <DashboardContent
        firstName={firstName}
        progress={progress}
        currentSemester={semesterNumber}
        completedUnits={completedUnits}
        semesters={courseData}
      />
    </PageTransitionWrapper>
  );
}