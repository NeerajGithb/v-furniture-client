"use client";

import { LucideIcon } from "lucide-react";
import { NavLink } from "@/components/NavigationLoader";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  loading?: boolean;
}

export const EmptyState = ({
  icon: IconComponent,
  title,
  description,
  actionLabel = "Start Shopping",
  actionHref = "/products",
  onAction,
  loading = false,
}: EmptyStateProps) => {
  if (loading) {
    return <LoadingSkeleton type="page" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-12 rounded shadow dark:shadow-gray-900 text-center">
        <IconComponent className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold dark:text-white mb-3">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
        {onAction ? (
          <button
            onClick={onAction}
            className="inline-block bg-black dark:bg-gray-700 text-white px-8 py-3 rounded font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition"
          >
            {actionLabel}
          </button>
        ) : (
          <NavLink
            href={actionHref}
            className="inline-block bg-black dark:bg-gray-700 text-white px-8 py-3 rounded font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition"
          >
            {actionLabel}
          </NavLink>
        )}
      </div>
    </div>
  );
};
