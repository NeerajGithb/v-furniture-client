import Pusher from "pusher";

// Server-side Pusher instance for client app
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

/**
 * Trigger a notification event for a specific user
 */
export async function triggerUserNotification(
  userId: string,
  notification: any,
) {
  try {
    await pusherServer.trigger(
      `user-${userId}`,
      "new-notification",
      notification,
    );
  } catch (error) {}
}

/**
 * Trigger an order update event for a specific user
 */
export async function triggerOrderUpdate(userId: string, order: any) {
  try {
    await pusherServer.trigger(`user-${userId}`, "order-update", order);
  } catch (error) {}
}
