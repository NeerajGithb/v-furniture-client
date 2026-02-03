"use client";

import { useCallback } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotificationData";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageLayout } from "@/components/layout/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { NotificationsHeader } from "./components/NotificationsHeader";
import { NotificationsList } from "./components/NotificationsList";
import { EmptyNotifications } from "./components/EmptyNotifications";

export default function NotificationsPage() {
  const { user, authLoading } = useAuth();

  // Check if user is ready for private data calls
  const isUserReady = !authLoading && !!user;

  // Data fetching hooks
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useNotifications({}, isUserReady);
  const { data: unreadCount = 0, isLoading: unreadLoading } =
    useUnreadCount(isUserReady);

  // Mutation hooks
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // Extract data
  const notifications = notificationsData?.notifications || [];
  const isLoading = notificationsLoading || unreadLoading;
  const error = notificationsError ? String(notificationsError) : null;

  // Action handlers
  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      await markAsReadMutation.mutateAsync(notificationId);
    },
    [markAsReadMutation],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  return (
    <AuthGuard
      redirectTo="/auth/signin?returnUrl=/notifications"
      message="Please sign in to view your notifications."
      icon={Bell}
    >
      <PageLayout className="max-w-4xl mx-auto px-4 py-8">
        <NotificationsHeader
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
          loading={isLoading}
        />

        {isLoading ? (
          <LoadingSkeleton type="page" />
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400">
              <p className="text-lg font-medium">Error loading notifications</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyNotifications loading={isLoading} />
        ) : (
          <NotificationsList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            loading={isLoading}
          />
        )}
      </PageLayout>
    </AuthGuard>
  );
}
