// lib/pendingRegistrations.ts
// Redis-based storage for pending registrations

import { redis } from '@/lib/cache';

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

const REDIS_PREFIX = 'pending_reg:';
const TTL_SECONDS = 10 * 60; // 10 minutes

export async function storePendingRegistration(
  email: string,
  data: Omit<PendingRegistration, 'expiresAt'>
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${REDIS_PREFIX}${normalizedEmail}`;

  await redis.set(key, data, { ex: TTL_SECONDS });

  console.log('✅ Stored pending registration in Redis for:', normalizedEmail);
}

export async function getPendingRegistration(
  email: string
): Promise<PendingRegistration | undefined> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${REDIS_PREFIX}${normalizedEmail}`;

  const data = await redis.get<PendingRegistration>(key);

  if (!data) {
    console.log('❌ No pending registration found in Redis for:', normalizedEmail);
    return undefined;
  }

  console.log('✅ Found pending registration in Redis for:', normalizedEmail);
  return data;
}

export async function deletePendingRegistration(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${REDIS_PREFIX}${normalizedEmail}`;

  await redis.del(key);

  console.log('🗑️ Deleted pending registration from Redis for:', normalizedEmail);
}