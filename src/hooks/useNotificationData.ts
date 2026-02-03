import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { notificationService } from "@/services/notificationService";
import { Notification, NotificationFilters } from "@/types/notification";

export const useNotifications = (
  filters: NotificationFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["notifications", filters],
    queryFn: () => notificationService.getNotifications(filters),
    enabled: enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - notifications don't change that frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus to reduce API calls
  });
};

export const useUnreadCount = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - unread count doesn't change that often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus to reduce API calls
    refetchInterval: enabled ? 5 * 60 * 1000 : false, // Poll every 5 minutes instead of 1 minute
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notifications data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark notification as read");
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalidate and refetch notifications data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark all notifications as read");
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notifications data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification dismissed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to dismiss notification");
    },
  });
};

export const useClearReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.clearReadNotifications(),
    onSuccess: () => {
      // Invalidate and refetch notifications data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Read notifications cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear read notifications");
    },
  });
};
