"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnitPage() {
  const { semesterId, chapterId, unitId } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to video section
    router.replace(`/course/${semesterId}/${chapterId}/${unitId}/video`);
  }, [semesterId, chapterId, unitId, router]);

  // Return null since this page will redirect immediately
  return null;
} 