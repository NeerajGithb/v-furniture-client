// lib/ai/groqErrors.ts

export type GroqErrorCode =
  | "BILLING_BLOCKED"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "NETWORK"
  | "AUTH"
  | "INVALID_REQUEST"
  | "SERVER"
  | "EMPTY_RESPONSE"
  | "UNKNOWN";

export class GroqError extends Error {
  code: GroqErrorCode;
  status?: number;

  constructor(code: GroqErrorCode, message: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function classifyGroqHttpError(
  status: number,
  bodyText: string
): GroqError {
  // Billing / spend limit
  if (
    bodyText.includes("blocked API access") ||
    bodyText.includes("spend alert")
  ) {
    return new GroqError(
      "BILLING_BLOCKED",
      "Groq billing limit reached",
      status
    );
  }

  // Rate limit
  if (status === 429) {
    return new GroqError("RATE_LIMIT", "Groq rate limit exceeded", status);
  }

  // Auth
  if (status === 401 || status === 403) {
    return new GroqError("AUTH", "Groq authentication failed", status);
  }

  // Server errors
  if (status >= 500) {
    return new GroqError("SERVER", "Groq server error", status);
  }

  // Invalid request
  return new GroqError(
    "INVALID_REQUEST",
    `Groq invalid request (${status})`,
    status
  );
}