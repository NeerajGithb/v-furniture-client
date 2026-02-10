import {
  INotificationsRepository,
  Notification,
  NotificationsResult,
} from "./INotificationsRepository";
import { NotificationsRepository } from "./NotificationsRepository";
import {
  GetNotificationsRequest,
  CreateNotificationRequest,
  UpdateNotificationRequest,
} from "./NotificationsSchemas";
import { InvalidNotificationActionError } from "./NotificationsErrors";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
} from "@/lib/cache";

export class NotificationsService {
  constructor(
    private repository: INotificationsRepository = new NotificationsRepository(),
  ) {}

  // Get user notifications
  async getUserNotifications(
    userId: string,
    options: GetNotificationsRequest,
  ): Promise<NotificationsResult> {
    const cacheKey = `notifications:user:${userId}:${JSON.stringify(options)}`;
    const cached = await getCached<NotificationsResult>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.repository.findByUserId(userId, options);

    // Cache for shorter time since notifications change frequently
    await setCache(cacheKey, result, 300); // 5 minutes

    return result;
  }

  // Create notification
  async createNotification(
    data: CreateNotificationRequest,
  ): Promise<{ success: true; message: string; notification: Notification }> {
    const notification = await this.repository.create(data);

    // Invalidate user notification caches
    const invalidatePromises = [];
    if (data.userId) {
      invalidatePromises.push(invalidateCacheByPrefix(`notifications:user:${data.userId}`));
    }
    if (data.sellerId) {
      invalidatePromises.push(invalidateCacheByPrefix(`notifications:seller:${data.sellerId}`));
    }
    
    await Promise.all(invalidatePromises);

    return {
      success: true,
      message: "Notification created successfully",
      notification,
    };
  }

  // Update notification (mark as read or dismiss)
  async updateNotification(
    userId: string,
    data: UpdateNotificationRequest,
  ): Promise<{
    success: true;
    message: string;
    notification?: Notification;
    count?: number;
  }> {
    let result: {
      success: true;
      message: string;
      notification?: Notification;
      count?: number;
    };

    if (data.markAll) {
      // Mark all as read
      const count = await this.repository.markAllAsRead(userId);
      result = {
        success: true,
        message: "All notifications marked as read",
        count,
      };
    } else if (data.dismissRead) {
      // Dismiss all read notifications
      const count = await this.repository.dismissAllRead(userId);
      result = {
        success: true,
        message: "All read notifications dismissed",
        count,
      };
    } else if (data.id) {
      // Update single notification
      let notification: Notification;

      if (data.action === "read") {
        notification = await this.repository.markAsRead(userId, data.id);
      } else if (data.action === "dismiss") {
        notification = await this.repository.dismiss(userId, data.id);
      } else {
        throw new InvalidNotificationActionError(data.action);
      }

      result = {
        success: true,
        message: `Notification ${data.action === "read" ? "marked as read" : "dismissed"} successfully`,
        notification,
      };
    } else {
      // This should never happen due to Zod validation
      throw new Error(
        "Either notification ID, markAll, or dismissRead parameter is required",
      );
    }

    // Invalidate caches
    await invalidateCacheByPrefix(`notifications:user:${userId}`);

    return result;
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const cacheKey = `notifications:unread:${userId}`;
    const cached = await getCached<{ count: number }>(cacheKey);

    if (cached) {
      return cached;
    }

    const count = await this.repository.countUnread(userId);
    const result = { count };

    await setCache(cacheKey, result, 300);
    return result;
  }
}

// Create default instance
export const notificationsService = new NotificationsService();