import { NextRequest, NextResponse } from "next/server";
import { AuthenticatedUser } from "@/lib/middleware/auth";

// Simple in-memory rate limiter
// For production with multiple servers, use Redis

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  remaining?: number;
  retryAfter?: number;
  message?: string;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old entries every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
      if (now - data.resetTime > 0) {
        rateLimitStore.delete(key);
      }
    }
  },
  10 * 60 * 1000,
);

/**
 * Core rate limiting function
 */
export function rateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000,
): RateLimitResult {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, record);
  }

  record.count++;

  if (record.count > maxAttempts) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return {
      success: false,
      retryAfter,
      message: `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
    };
  }

  return {
    success: true,
    remaining: maxAttempts - record.count,
  };
}

/**
 * Reset rate limit for a specific identifier
 */
export function resetRateLimit(identifier: string): void {
  const key = `ratelimit:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Extract IP address from request headers
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Apply rate limiting for payment requests
 * - 5 requests per minute per user
 * - 10 requests per minute per IP
 */
export function checkPaymentRateLimit(
  request: NextRequest,
  user: AuthenticatedUser,
): NextResponse | null {
  // User-based rate limiting
  const userRateLimit = rateLimit(`payment:user:${user.userId}`, 5, 60 * 1000);
  if (!userRateLimit.success) {
    return NextResponse.json({ error: userRateLimit.message }, { status: 429 });
  }

  // IP-based rate limiting
  const ipAddress = getClientIp(request);
  const ipRateLimit = rateLimit(`payment:ip:${ipAddress}`, 10, 60 * 1000);
  if (!ipRateLimit.success) {
    return NextResponse.json(
      { error: "Too many payment requests. Please try again later." },
      { status: 429 },
    );
  }

  return null; // No rate limit hit
}

/**
 * Apply rate limiting for order requests
 * - 10 requests per minute per user
 * - 20 requests per minute per IP
 */
export function checkOrderRateLimit(
  request: NextRequest,
  user: AuthenticatedUser,
): NextResponse | null {
  const ipAddress = getClientIp(request);

  // IP-based rate limiting
  const ipKey =
    ipAddress !== "unknown"
      ? `order:ip:${ipAddress}`
      : `order:ip:fallback:${user.userId}`;

  const ipRateLimit = rateLimit(ipKey, 20, 60_000);
  if (!ipRateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  // User-based rate limiting
  const userRateLimit = rateLimit(`order:user:${user.userId}`, 10, 60_000);
  if (!userRateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  return null; // No rate limit hit
}
