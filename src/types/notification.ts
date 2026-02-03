// Notification types
export interface Notification {
  _id: string;
  type: string;
  subType: string;
  priority: number;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
  dismissed: boolean;
  dismissedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
  actions?: Array<{
    label: string;
    action: string;
    style?: "primary" | "secondary" | "danger";
  }>;
  channels?: string[];
  expiresAt?: string;
  groupId?: string;
}

export interface NotificationFilters {
  type?: string;
  read?: boolean;
  limit?: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface MarkAsReadRequest {
  notificationId?: string;
  all?: boolean;
}

export interface PusherNotification {
  id: string;
  type: string;
  subType: string;
  priority: string;
  title: string;
  message: string;
  link?: string;
  createdAt: string;
}
