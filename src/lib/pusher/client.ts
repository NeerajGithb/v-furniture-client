"use client";

import Pusher from "pusher-js";

let pusherClient: Pusher | null = null;
let connectionFailed = false;

export function isPusherAvailable(): boolean {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  return !!(key && cluster && !connectionFailed);
}

export function getPusherClient(): Pusher {
  if (!pusherClient && isPusherAvailable()) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

    pusherClient = new Pusher(key, {
      cluster,
      forceTLS: true,
      activityTimeout: 30000,
      pongTimeout: 6000,
      unavailableTimeout: 10000,
      enabledTransports: ['ws', 'wss'],
      disabledTransports: [],
    });

    pusherClient.connection.bind('connecting', () => {});

    pusherClient.connection.bind('connected', () => {
      connectionFailed = false;
    });

    pusherClient.connection.bind('disconnected', () => {});

    pusherClient.connection.bind('failed', () => {
      connectionFailed = true;
    });

    pusherClient.connection.bind('error', (error: any) => {
      connectionFailed = true;
    });

    pusherClient.connection.bind('unavailable', () => {
      connectionFailed = true;
    });
  }
  
  if (!pusherClient) {
    throw new Error('Pusher client is not available');
  }
  
  return pusherClient;
}

export function subscribeToUserNotifications(
  userId: string,
  onNotification: (notification: any) => void,
) {
  if (!isPusherAvailable()) {
    return () => {};
  }

  try {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`user-${userId}`);

    channel.bind('pusher:subscription_error', (error: any) => {});

    channel.bind('pusher:subscription_succeeded', () => {});

    channel.bind("new-notification", onNotification);

    return () => {
      try {
        channel.unbind("new-notification", onNotification);
        pusher.unsubscribe(`user-${userId}`);
      } catch (error) {}
    };
  } catch (error) {
    return () => {};
  }
}

export function subscribeToOrderUpdates(
  userId: string,
  onOrderUpdate: (order: any) => void,
) {
  if (!isPusherAvailable()) {
    return () => {};
  }

  try {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`user-${userId}`);

    channel.bind('pusher:subscription_error', (error: any) => {});

    channel.bind('pusher:subscription_succeeded', () => {});

    channel.bind("order-update", onOrderUpdate);

    return () => {
      try {
        channel.unbind("order-update", onOrderUpdate);
        pusher.unsubscribe(`user-${userId}`);
      } catch (error) {}
    };
  } catch (error) {
    return () => {};
  }
}

export function disconnectPusher() {
  if (pusherClient) {
    try {
      pusherClient.disconnect();
      pusherClient = null;
    } catch (error) {}
  }
}
