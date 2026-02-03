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
import {
  NotificationNotFoundError,
  InvalidNotificationActionError,
} from "./NotificationsErrors";
import { RepositoryError } from "../shared/InfrastructureError";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  CACHE_TTL,
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

    try {
      const result = await this.repository.findByUserId(userId, options);

      // Cache for shorter time since notifications change frequently
      await setCache(cacheKey, result, 300); // 5 minutes

      return result;
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve notifications");
      }
      throw error; // Re-throw domain errors
    }
  }

  // Create notification
  async createNotification(
    data: CreateNotificationRequest,
  ): Promise<{ success: true; message: string; notification: Notification }> {
    try {
      const notification = await this.repository.create(data);

      // Invalidate user notification caches
      if (data.userId) {
        await invalidateCacheByPrefix(`notifications:user:${data.userId}`);
      }
      if (data.sellerId) {
        await invalidateCacheByPrefix(`notifications:seller:${data.sellerId}`);
      }

      return {
        success: true,
        message: "Notification created successfully",
        notification,
      };
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to create notification");
      }
      throw error; // Re-throw domain errors
    }
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
    try {
      if (data.markAll) {
        // Mark all as read
        const count = await this.repository.markAllAsRead(userId);

        // Invalidate caches
        await invalidateCacheByPrefix(`notifications:user:${userId}`);

        return {
          success: true,
          message: "All notifications marked as read",
          count,
        };
      } else if (data.dismissRead) {
        // Dismiss all read notifications
        const count = await this.repository.dismissAllRead(userId);

        // Invalidate caches
        await invalidateCacheByPrefix(`notifications:user:${userId}`);

        return {
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

        // Invalidate caches
        await invalidateCacheByPrefix(`notifications:user:${userId}`);

        return {
          success: true,
          message: `Notification ${data.action === "read" ? "marked as read" : "dismissed"} successfully`,
          notification,
        };
      }

      // This should never happen due to Zod validation
      throw new Error(
        "Either notification ID, markAll, or dismissRead parameter is required",
      );
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (
        error instanceof NotificationNotFoundError ||
        error instanceof InvalidNotificationActionError
      ) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to update notification");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const cacheKey = `notifications:unread:${userId}`;
    const cached = await getCached<{ count: number }>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const count = await this.repository.countUnread(userId);
      const result = { count };

      await setCache(cacheKey, result, 300);
      return result;
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to get unread count");
      }
      throw error; // Re-throw domain errors
    }
  }
}

// Create default instance
export const notificationsService = new NotificationsService();
