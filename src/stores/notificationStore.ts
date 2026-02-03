import { create } from "zustand";
import { toast } from "react-hot-toast";
import { subscribeToUserNotifications, isPusherAvailable } from "@/lib/pusher/client";
import { PusherNotification } from "@/types/notification";

interface NotificationState {
  // Real-time state
  pusherUnsubscribe: (() => void) | null;

  // UI state
  isNotificationPanelOpen: boolean;

  // Actions
  subscribeToPusher: (userId: string) => void;
  unsubscribeFromPusher: () => void;
  setNotificationPanelOpen: (open: boolean) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Real-time state
  pusherUnsubscribe: null,

  // UI state
  isNotificationPanelOpen: false,

  subscribeToPusher: (userId: string) => {
    try {
      // Check if Pusher is available before attempting to subscribe
      if (!isPusherAvailable()) {
        console.warn('Pusher is not available, real-time notifications will be disabled');
        return;
      }

      // Unsubscribe from previous subscription if exists
      const currentUnsubscribe = get().pusherUnsubscribe;
      if (currentUnsubscribe) {
        currentUnsubscribe();
      }

      // Subscribe to new channel
      const unsubscribe = subscribeToUserNotifications(
        userId,
        async (notification: PusherNotification) => {
          // Show toast notification
          toast.success(notification.title, {
            duration: 4000,
            icon: "🔔",
          });
        },
      );

      set({ pusherUnsubscribe: unsubscribe });
    } catch (error) {
      console.error('Failed to subscribe to Pusher notifications:', error);
      // Don't throw error - app should continue working without real-time notifications
    }
  },

  unsubscribeFromPusher: () => {
    try {
      const unsubscribe = get().pusherUnsubscribe;
      if (unsubscribe) {
        unsubscribe();
        set({ pusherUnsubscribe: null });
      }
    } catch (error) {
      console.error('Error unsubscribing from Pusher:', error);
      // Still clear the reference even if unsubscribe fails
      set({ pusherUnsubscribe: null });
    }
  },

  setNotificationPanelOpen: (open: boolean) => {
    set({ isNotificationPanelOpen: open });
  },

  reset: () => {
    try {
      // Unsubscribe from Pusher
      const unsubscribe = get().pusherUnsubscribe;
      if (unsubscribe) {
        unsubscribe();
      }
    } catch (error) {
      console.error('Error during Pusher reset:', error);
    }

    set({
      pusherUnsubscribe: null,
      isNotificationPanelOpen: false,
    });
  },
}));
