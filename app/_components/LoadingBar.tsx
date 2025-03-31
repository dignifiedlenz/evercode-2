"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoadingBar } from "../_hooks/useLoadingBar";

export default function LoadingBar() {
  const [progress, setProgress] = useState(0);
  const { isLoading, stopLoading } = useLoadingBar();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Effect to handle progress animation
  useEffect(() => {
    if (!isLoading) return;

    // Start progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isLoading]);

  // Effect to handle page change completion
  useEffect(() => {
    if (isLoading) {
      setProgress(100);
      const timeout = setTimeout(() => {
        stopLoading();
        setProgress(0);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams, isLoading, stopLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="h-1 bg-secondary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
} 