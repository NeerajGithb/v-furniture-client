// Account security: lockout, failed attempts tracking

interface FailedAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

const failedAttempts = new Map<string, FailedAttempt>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const RESET_WINDOW = 15 * 60 * 1000; // Reset after 15 minutes of no attempts

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > RESET_WINDOW && !data.lockedUntil) {
      failedAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function recordFailedLogin(email: string): { locked: boolean; remainingAttempts: number; lockedUntil?: number } {
  const now = Date.now();
  let record = failedAttempts.get(email);
  
  if (!record) {
    record = {
      count: 0,
      lastAttempt: now,
      lockedUntil: null,
    };
  }
  
  // Reset count if last attempt was more than RESET_WINDOW ago
  if (now - record.lastAttempt > RESET_WINDOW) {
    record.count = 0;
    record.lockedUntil = null;
  }
  
  record.count++;
  record.lastAttempt = now;
  
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION;
  }
  
  failedAttempts.set(email, record);
  
  return {
    locked: record.count >= MAX_FAILED_ATTEMPTS,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.count),
    lockedUntil: record.lockedUntil || undefined,
  };
}

export function isAccountLocked(email: string): { locked: boolean; lockedUntil?: number; remainingTime?: number } {
  const record = failedAttempts.get(email);
  
  if (!record || !record.lockedUntil) {
    return { locked: false };
  }
  
  const now = Date.now();
  
  if (now >= record.lockedUntil) {
    // Lockout expired, reset
    record.count = 0;
    record.lockedUntil = null;
    failedAttempts.set(email, record);
    return { locked: false };
  }
  
  const remainingTime = Math.ceil((record.lockedUntil - now) / 1000);
  
  return {
    locked: true,
    lockedUntil: record.lockedUntil,
    remainingTime,
  };
}

export function resetFailedAttempts(email: string): void {
  failedAttempts.delete(email);
}

export function getFailedAttempts(email: string): number {
  const record = failedAttempts.get(email);
  return record?.count || 0;
}