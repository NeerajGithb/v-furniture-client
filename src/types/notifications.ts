import { Notification } from "./notification";

// Notifications page data
export interface NotificationsPageData {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// Notifications header component props
export interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  loading?: boolean;
}

// Notification item component props
export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  loading?: boolean;
}

// Notifications list component props
export interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  loading?: boolean;
}

// Empty notifications component props
export interface EmptyNotificationsProps {
  loading?: boolean;
}

// Notification priority and type mappings
export interface NotificationDisplay {
  priorityColor: string;
  typeIcon: React.ReactNode;
  iconBgColor: string;
}
