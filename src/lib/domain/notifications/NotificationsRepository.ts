import {
  INotificationsRepository,
  Notification,
  NotificationsResult,
} from "./INotificationsRepository";
import { NotificationNotFoundError } from "./NotificationsErrors";
import {
  GetNotificationsRequest,
  CreateNotificationRequest,
} from "./NotificationsSchemas";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import { withTransaction } from "@/lib/utils/transaction";
import NotificationModel from "@/models/Notification";

export class NotificationsRepository implements INotificationsRepository {
  // Find notifications by user ID
  async findByUserId(
    userId: string,
    options: GetNotificationsRequest,
  ): Promise<NotificationsResult> {
    const query: any = { userId };

    // By default, exclude dismissed notifications unless explicitly requested
    if (!options.includeRead) {
      query.dismissed = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      NotificationModel.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .limit(options.limit)
        .lean(),
      NotificationModel.countDocuments({
        userId,
        read: false,
        dismissed: false,
      }),
    ]);

    return {
      notifications: safeMapList(
        notifications,
        this.mapToNotification.bind(this),
        "notification",
      ),
      unreadCount,
    };
  }

  // Create notification with transaction support
  async create(data: CreateNotificationRequest): Promise<Notification> {
    return await withTransaction(async (session) => {
      const notification = new NotificationModel({
        ...data,
        read: false,
        dismissed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await notification.save({ session });
      return this.mapToNotification(notification.toObject());
    });
  }

  // Mark notification as read with transaction support
  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<Notification> {
    return await withTransaction(async (session) => {
      const notification = await NotificationModel.findOneAndUpdate(
        { _id: notificationId, userId },
        {
          read: true,
          readAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true, session },
      ).lean();

      if (!notification) {
        throw new NotificationNotFoundError(notificationId);
      }

      return this.mapToNotification(notification);
    });
  }

  // Mark all notifications as read with transaction support
  async markAllAsRead(userId: string): Promise<number> {
    return await withTransaction(async (session) => {
      const result = await NotificationModel.updateMany(
        { userId, read: false },
        {
          read: true,
          readAt: new Date(),
          updatedAt: new Date(),
        },
        { session },
      );

      return result.modifiedCount;
    });
  }

  // Dismiss notification with transaction support
  async dismiss(userId: string, notificationId: string): Promise<Notification> {
    return await withTransaction(async (session) => {
      const notification = await NotificationModel.findOneAndUpdate(
        { _id: notificationId, userId },
        {
          dismissed: true,
          dismissedAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true, session },
      ).lean();

      if (!notification) {
        throw new NotificationNotFoundError(notificationId);
      }

      return this.mapToNotification(notification);
    });
  }

  // Dismiss all read notifications
  async dismissAllRead(userId: string): Promise<number> {
    const result = await NotificationModel.updateMany(
      {
        userId,
        read: true,
        dismissed: false,
      },
      {
        dismissed: true,
        dismissedAt: new Date(),
        updatedAt: new Date(),
      },
    );

    return result.modifiedCount;
  }

  // Count unread notifications
  async countUnread(userId: string): Promise<number> {
    return await NotificationModel.countDocuments({
      userId,
      read: false,
      dismissed: false,
    });
  }

  // Private helper method
  private mapToNotification(db: any): Notification {
    validateRequiredFields(db, ["_id"], "notification");

    return {
      ...db,
      _id: db._id.toString(),
    };
  }
}