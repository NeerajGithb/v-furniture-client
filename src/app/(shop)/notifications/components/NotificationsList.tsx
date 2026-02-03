"use client";

import { NotificationsListProps } from "@/types/notifications";
import { NotificationItem } from "./NotificationItem";

export const NotificationsList = ({
  notifications,
  onMarkAsRead,
  loading,
}: NotificationsListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <NotificationItem
            key={i}
            notification={{} as any}
            onMarkAsRead={() => {}}
            loading={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};
