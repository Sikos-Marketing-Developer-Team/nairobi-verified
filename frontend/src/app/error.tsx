"use client";

import { useEffect } from "react";
import Link from "next/link";
import MainLayout from "../components/MainLayout";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
        <h1 className="text-6xl font-bold text-orange-600 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
          We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
        </p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}