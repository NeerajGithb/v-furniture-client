"use client";

import { Bell } from "lucide-react";
import { EmptyNotificationsProps } from "@/types/notifications";

export const EmptyNotifications = ({ loading }: EmptyNotificationsProps) => {
  if (loading) {
    return (
      <div className="text-center py-16 animate-pulse">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No notifications yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        We'll notify you when something important happens
      </p>
    </div>
  );
};
