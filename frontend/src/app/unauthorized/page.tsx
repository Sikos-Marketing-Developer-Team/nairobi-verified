"use client";

import Link from "next/link";
import MainLayout from "@/components/MainLayout";

export default function UnauthorizedPage() {
  return (
    <MainLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
        <h1 className="text-6xl font-bold text-orange-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
          You don't have permission to access this page. Please contact the administrator if you believe this is a mistake.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Return to Homepage
          </Link>
          <Link
            href="/auth/signin"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </MainLayout>
  );
} 