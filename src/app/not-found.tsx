"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Error Code */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          404 Not Found
        </p>

        {/* Message */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you are looking for doesn't exist. Click button below to go
          to the homepage.
        </p>

        {/* Button */}
        <button
          onClick={() => router.push("/")}
          className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Back to Homepage
        </button>
      </div>
    </div>
  );
}
