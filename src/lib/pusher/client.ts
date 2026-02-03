"use client";

import Pusher from "pusher-js";

let pusherClient: Pusher | null = null;
let connectionFailed = false;

/**
 * Check if Pusher is available and configured
 */
export function isPusherAvailable(): boolean {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  return !!(key && cluster && !connectionFailed);
}

/**
 * Get or create Pusher client instance with error handling
 */
export function getPusherClient(): Pusher {
  if (!pusherClient && isPusherAvailable()) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

    pusherClient = new Pusher(key, {
      cluster,
      forceTLS: true,
      // Add connection timeout and retry configuration
      activityTimeout: 30000, // 30 seconds
      pongTimeout: 6000, // 6 seconds
      unavailableTimeout: 10000, // 10 seconds
      // Enable connection state logging in development
      enabledTransports: ['ws', 'wss'],
      disabledTransports: [],
    });

    // Add connection event handlers for better debugging
    pusherClient.connection.bind('connecting', () => {
      console.log('Pusher: Connecting...');
    });

    pusherClient.connection.bind('connected', () => {
      console.log('Pusher: Connected successfully');
      connectionFailed = false;
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('Pusher: Disconnected');
    });

    pusherClient.connection.bind('failed', () => {
      console.warn('Pusher: Connection failed');
      connectionFailed = true;
    });

    pusherClient.connection.bind('error', (error: any) => {
      console.error('Pusher connection error:', error);
      connectionFailed = true;
    });

    pusherClient.connection.bind('unavailable', () => {
      console.warn('Pusher: Connection unavailable');
      connectionFailed = true;
    });
  }
  
  if (!pusherClient) {
    throw new Error('Pusher client is not available');
  }
  
  return pusherClient;
}

/**
 * Subscribe to user notifications (for client app) with error handling
 */
export function subscribeToUserNotifications(
  userId: string,
  onNotification: (notification: any) => void,
) {
  if (!isPusherAvailable()) {
    console.warn('Pusher is not available, skipping real-time notifications');
    return () => {}; // Return no-op function
  }

  try {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`user-${userId}`);

    // Add error handling for channel subscription
    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher subscription error:', error);
    });

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`Successfully subscribed to user-${userId} channel`);
    });

    channel.bind("new-notification", onNotification);

    return () => {
      try {
        channel.unbind("new-notification", onNotification);
        pusher.unsubscribe(`user-${userId}`);
      } catch (error) {
        console.error('Error unsubscribing from Pusher:', error);
      }
    };
  } catch (error) {
    console.error('Error setting up Pusher subscription:', error);
    // Return a no-op function if subscription fails
    return () => {};
  }
}

/**
 * Subscribe to order updates (for client app) with error handling
 */
export function subscribeToOrderUpdates(
  userId: string,
  onOrderUpdate: (order: any) => void,
) {
  if (!isPusherAvailable()) {
    console.warn('Pusher is not available, skipping real-time order updates');
    return () => {}; // Return no-op function
  }

  try {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`user-${userId}`);

    // Add error handling for channel subscription
    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher subscription error:', error);
    });

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`Successfully subscribed to user-${userId} channel for order updates`);
    });

    channel.bind("order-update", onOrderUpdate);

    return () => {
      try {
        channel.unbind("order-update", onOrderUpdate);
        pusher.unsubscribe(`user-${userId}`);
      } catch (error) {
        console.error('Error unsubscribing from Pusher:', error);
      }
    };
  } catch (error) {
    console.error('Error setting up Pusher order subscription:', error);
    // Return a no-op function if subscription fails
    return () => {};
  }
}

/**
 * Disconnect Pusher client (useful for cleanup)
 */
export function disconnectPusher() {
  if (pusherClient) {
    try {
      pusherClient.disconnect();
      pusherClient = null;
      console.log('Pusher client disconnected and reset');
    } catch (error) {
      console.error('Error disconnecting Pusher:', error);
    }
  }
}
