import {
  GetNotificationsRequest,
  CreateNotificationRequest,
} from "./NotificationsSchemas";

export interface Notification {
  _id: string;
  sellerId?: string;
  userId?: string;
  type: string;
  subType: string;
  priority: number;
  title: string;
  message: string;
  link?: string;
  actions?: Array<{
    label: string;
    action: string;
    style?: "primary" | "secondary" | "danger";
  }>;
  metadata?: Record<string, any>;
  channels: string[];
  read: boolean;
  readAt?: Date;
  dismissed: boolean;
  dismissedAt?: Date;
  expiresAt?: Date;
  groupId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationsResult {
  notifications: Notification[];
  unreadCount: number;
}

export interface INotificationsRepository {
  // Get notifications for user
  findByUserId(
    userId: string,
    options: GetNotificationsRequest,
  ): Promise<NotificationsResult>;

  // Create notification
  create(data: CreateNotificationRequest): Promise<Notification>;

  // Update notification
  markAsRead(userId: string, notificationId: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<number>; // returns count of updated notifications

  // Dismiss notification
  dismiss(userId: string, notificationId: string): Promise<Notification>;
  dismissAllRead(userId: string): Promise<number>; // returns count of dismissed notifications

  // Count unread notifications
  countUnread(userId: string): Promise<number>;
}
