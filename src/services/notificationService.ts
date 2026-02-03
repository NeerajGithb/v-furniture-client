// Frontend notification service - makes HTTP calls to API endpoints
import { BasePrivateService } from "./baseService";
import {
  NotificationFilters,
  NotificationsResponse,
} from "@/types/notification";

class NotificationService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get user notifications with unread count
  async getNotifications(
    filters: NotificationFilters = {},
  ): Promise<NotificationsResponse> {
    // Transform frontend filters to API parameters
    const params: Record<string, string> = {};

    if (filters.limit) {
      params.limit = filters.limit.toString();
    }

    // API uses includeRead instead of read filter
    if (filters.read !== undefined) {
      params.includeRead = (!filters.read).toString(); // Invert logic: read=false means includeRead=true
    }

    const response = await this.get<{ data: NotificationsResponse }>(
      "/notifications",
      params,
    );
    return response.data?.data || { notifications: [], unreadCount: 0 };
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await this.patch(`/notifications?id=${notificationId}&action=read`);
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await this.patch("/notifications?markAll=true&action=read");
  }

  // Get unread count from notifications response
  async getUnreadCount(): Promise<number> {
    const response = await this.getNotifications({ limit: 1 });
    return response.unreadCount || 0;
  }

  // Dismiss notification (API doesn't have delete, uses dismiss)
  async deleteNotification(notificationId: string): Promise<void> {
    await this.patch(`/notifications?id=${notificationId}&action=dismiss`);
  }

  // Clear all read notifications using bulk dismiss API
  async clearReadNotifications(): Promise<void> {
    await this.patch("/notifications?dismissRead=true&action=dismiss");
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
