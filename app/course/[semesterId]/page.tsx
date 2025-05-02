"use client";

import { useEffect, useMemo, use } from "react";
import DashboardContent from "../../_components/DashboardContent";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Semester } from "@/types/course";
import courseData from "../../_components/(semester1)/courseData";

interface PageProps {
  params: Promise<{
    semesterId: string;
  }>;
}

export default function SemesterPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const semesterNumber = useMemo(() => {
    if (!resolvedParams?.semesterId || typeof resolvedParams.semesterId !== 'string') {
      console.error('Invalid or missing semesterId in params');
      return 1; 
    }
    return parseInt(resolvedParams.semesterId.split("-")[1]) || 1; 
  }, [resolvedParams]);

  const currentSemesterData = useMemo(() => {
    return courseData.find(sem => sem.id === `semester-${semesterNumber}`);
  }, [semesterNumber]);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('SemesterPage: No user found after auth check, redirecting...');
      // Add a delay to avoid immediate redirects which could contribute to loops
      const redirectTimer = setTimeout(() => {
        router.push("/auth/signin");
      }, 1000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, authLoading, router]);

  if (authLoading) { 
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-white font-morion">Loading Authentication...</div> 
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-white font-morion">Redirecting to sign in...</div> 
      </div>
    ); 
  }
  
  if (!currentSemesterData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-white font-morion">Error: Semester data not found for ID {resolvedParams?.semesterId}.</div> 
      </div>
    );
  }

  return (
    <DashboardContent
      firstName={user.firstName || "User"}
      currentSemester={semesterNumber}
      semesters={courseData}
    />
  );
}