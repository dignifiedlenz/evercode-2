// app/course/layout.tsx
import React from 'react';

// Outer layout for /course - simplified
export default function CourseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout no longer needs to handle auth or specific semester logic.
  // It just provides a common structure if needed, or simply passes children through.
  return <>{children}</>; // Render children directly or wrap in a common div if needed
}
