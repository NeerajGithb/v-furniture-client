export interface ApiError extends Error {
  status: number;
  body: any;
  code?: string;
}

export interface ParseError extends Error {
  status: number;
  body: null;
  originalError: Error;
}

export interface TimeoutError extends Error {
  timeout: number;
}

export interface NetworkError extends Error {
  cause?: Error;
}

export type FetchError = ApiError | ParseError | TimeoutError | NetworkError;

// Type guard to check if error is API error (4xx/5xx with response body)
export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    "status" in error &&
    "body" in error &&
    error.body !== null
  );
}

// Type guard to check if error is parse error (invalid JSON response)
export function isParseError(error: unknown): error is ParseError {
  return (
    error instanceof Error &&
    "originalError" in error &&
    "body" in error &&
    error.body === null
  );
}

// Type guard to check if error is timeout error (request exceeded time limit)
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof Error && "timeout" in error;
}

// Type guard to check if error is network error (connection failed)
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof Error && error.name === "NetworkError";
}

// Fetch wrapper that includes credentials and handles network errors
export async function fetchWithCredentials(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const headers: Record<string, string> = {};

  if (!(init?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      ...headers,
      ...init?.headers,
    },
  });

  return response;
}

export async function handleApiResponse<T = any>(
  response: Response,
): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  // If response is not OK (4xx, 5xx), throw ApiError with exact backend response
  if (!response.ok) {
    const error = new Error(
      data?.error?.message || data?.message || `HTTP ${response.status}: ${response.statusText}`
    ) as ApiError;
    error.status = response.status;
    error.body = data; // Preserve EXACT backend response
    error.code = data?.error?.code || `HTTP_${response.status}`;
    error.name = "ApiError";
    throw error;
  }

  return data;
}

// Create strongly typed timeout error with elapsed time
export function createTimeoutError(timeout: number): TimeoutError {
  const error = new Error(`Request timeout after ${timeout}ms`) as TimeoutError;
  error.name = "TimeoutError";
  error.timeout = timeout;
  return error;
}