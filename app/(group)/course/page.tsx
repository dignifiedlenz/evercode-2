import React, { Suspense } from "react";
import CourseClientComponent from "./CourseClientComponent";

export default function CoursePage() {
  return (
    <div>
      <h1>Course Page</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <CourseClientComponent />
      </Suspense>
      {/* Rest of your page */}
    </div>
  );
}
