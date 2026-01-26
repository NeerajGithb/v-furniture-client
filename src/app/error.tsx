'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419] pt-20 p-4">
      <div className="max-w-md w-full mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
          <AlertTriangle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Message */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Something Went Wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          An unexpected error occurred. Please try again.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3 mb-6 text-left">
            <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}