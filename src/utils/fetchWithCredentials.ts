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
  try {
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
  } catch (fetchError) {
    const error = new Error(
      `Network request failed: ${(fetchError as Error).message}`,
    ) as NetworkError;
    error.name = "NetworkError";
    error.cause = fetchError as Error;
    throw error;
  }
}

// Parse JSON response and throw typed errors for HTTP failures
export async function handleApiResponse<T = any>(
  response: Response,
): Promise<T> {
  let data: any;

  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  } catch (parseError) {
    const error = new Error(
      `Response parsing failed: ${response.statusText}`,
    ) as ParseError;
    error.status = response.status;
    error.body = null;
    error.originalError = parseError as Error;
    error.name = "ParseError";
    throw error;
  }

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      data?.message ||
      `HTTP ${response.status}: ${response.statusText}`;

    const error = new Error(errorMessage) as ApiError;
    error.status = response.status;
    error.body = data;
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
