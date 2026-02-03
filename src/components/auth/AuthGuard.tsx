"use client";

import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@/components/NavigationLoader";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const AuthGuard = ({
  children,
  fallback,
  redirectTo = "/auth/signin",
  requireAuth = true,
  message = "Please sign in to access this page.",
  icon: IconComponent = Heart,
}: AuthGuardProps) => {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return <LoadingSkeleton type="page" />;
  }

  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default auth required fallback with custom message
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const signInUrl = `${redirectTo}?returnUrl=${currentPath}`;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <div className="w-16 h-16 bg-black dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-base">
            {message}
          </p>
          <button
            onClick={() => navigate.push(signInUrl)}
            className="w-full bg-black dark:bg-gray-700 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-sm"
          >
            Sign In
          </button>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() =>
                navigate.push(`/auth/signup?returnUrl=${currentPath}`)
              }
              className="text-black dark:text-white font-medium hover:underline"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
