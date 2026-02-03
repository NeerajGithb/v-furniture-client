// lib/pendingRegistrations.ts
// Redis-based storage for pending registrations

import { redis } from "@/lib/cache";

interface PendingRegistration {
  name: string;
  email: string;
  password: string;
  photoURL?: string;
  hasOAuth: boolean;
  verificationCode: string;
  ipAddress: string;
  userAgent: string;
}

const REDIS_PREFIX = "pending_reg:";
const TTL_SECONDS = 10 * 60; // 10 minutes

export async function storePendingRegistration(
  email: string,
  data: Omit<PendingRegistration, "expiresAt">,
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${REDIS_PREFIX}${normalizedEmail}`;

  await redis.set(key, data, { ex: TTL_SECONDS });
}

export async function getPendingRegistration(
  email: string,
): Promise<PendingRegistration | undefined> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${REDIS_PREFIX}${normalizedEmail}`;

  const data = await redis.get<PendingRegistration>(key);

  if (!data) {
    return undefined;
  }

  return data;
}

export async function deletePendingRegistration(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${REDIS_PREFIX}${normalizedEmail}`;

  await redis.del(key);
}

// Extend TTL for pending registration (useful for resend OTP)
export async function extendPendingRegistrationTTL(
  email: string,
): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${REDIS_PREFIX}${normalizedEmail}`;

  // Check if key exists and extend its TTL
  const result = await redis.expire(key, TTL_SECONDS);
  return result === 1; // Returns 1 if key exists and TTL was set
}
