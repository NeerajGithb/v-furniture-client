"use client";

import { Bell, Package, CreditCard, Info } from "lucide-react";
import { NavLink } from "@/components/NavigationLoader";
import { NotificationItemProps } from "@/types/notifications";
import { Notification } from "@/types/notification";

function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return past.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

const getPriorityColor = (priority: number) => {
  if (priority >= 5) {
    return "border-l-red-500 bg-red-50 dark:bg-red-900/10";
  } else if (priority >= 4) {
    return "border-l-orange-500 bg-orange-50 dark:bg-orange-900/10";
  } else if (priority >= 3) {
    return "border-l-blue-500 bg-blue-50 dark:bg-blue-900/10";
  } else {
    return "border-l-gray-500 bg-gray-50 dark:bg-gray-900/10";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "order":
      return <Package className="w-5 h-5" />;
    case "payment":
      return <CreditCard className="w-5 h-5" />;
    case "system":
      return <Info className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

const getIconBgColor = (priority: number) => {
  if (priority >= 5) {
    return "bg-red-100 text-red-600 dark:bg-red-900/30";
  } else if (priority >= 4) {
    return "bg-orange-100 text-orange-600 dark:bg-orange-900/30";
  } else if (priority >= 3) {
    return "bg-blue-100 text-blue-600 dark:bg-blue-900/30";
  } else {
    return "bg-gray-100 text-gray-600 dark:bg-gray-900/30";
  }
};

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  loading,
}: NotificationItemProps) => {
  const handleNotificationClick = async () => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  if (loading) {
    return (
      <div className="border-l-4 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/10 border-l-gray-500 border-opacity-30">
        <div className="flex items-start gap-3 animate-pulse">
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-l-4 rounded-lg p-4 transition-all ${getPriorityColor(
        notification.priority,
      )} ${
        !notification.read
          ? "border-opacity-100"
          : "border-opacity-30 opacity-70"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-full ${getIconBgColor(notification.priority)}`}
        >
          {getTypeIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {notification.message}
              </p>
            </div>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimeAgo(notification.createdAt)}
            </span>

            {notification.link && (
              <NavLink
                href={notification.link}
                onClick={handleNotificationClick}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View Details →
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
