"use client";

import { CheckCheck } from "lucide-react";
import { NotificationsHeaderProps } from "@/types/notifications";

export const NotificationsHeader = ({
  unreadCount,
  onMarkAllAsRead,
  loading,
}: NotificationsHeaderProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
            : "All caught up!"}
        </p>
      </div>
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllAsRead}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      )}
    </div>
  );
};
