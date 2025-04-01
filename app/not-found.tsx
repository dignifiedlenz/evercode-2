"use client";

import Link from "next/link";
import { Suspense } from "react";

function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/65">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
        <p className="text-gray-300 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black/65">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
          <p className="text-gray-300 mb-8">Loading...</p>
          <Link
            href="/"
            className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
} 