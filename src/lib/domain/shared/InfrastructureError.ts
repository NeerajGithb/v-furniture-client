// Infrastructure error classes for system-level failures
export abstract class InfrastructureError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      cause: this.cause?.message,
    };
  }
}

// Repository errors for data access failures
export class RepositoryError extends InfrastructureError {
  readonly code = "REPOSITORY_ERROR";
  readonly statusCode = 500;

  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

// Database connection errors
export class DatabaseUnavailableError extends InfrastructureError {
  readonly code = "DATABASE_UNAVAILABLE";
  readonly statusCode = 503; // Service Unavailable

  constructor(
    message: string = "Database is currently unavailable",
    cause?: Error,
  ) {
    super(message, cause);
  }
}

// Database configuration errors
export class DatabaseConfigurationError extends InfrastructureError {
  readonly code = "DATABASE_CONFIGURATION_ERROR";
  readonly statusCode = 500; // Internal Server Error

  constructor(message: string = "Database configuration error", cause?: Error) {
    super(message, cause);
  }
}

// Cache service errors
export class CacheUnavailableError extends InfrastructureError {
  readonly code = "CACHE_UNAVAILABLE";
  readonly statusCode = 503; // Service Unavailable

  constructor(
    message: string = "Cache service is currently unavailable",
    cause?: Error,
  ) {
    super(message, cause);
  }
}

// External service errors
export class ExternalServiceError extends InfrastructureError {
  readonly code = "EXTERNAL_SERVICE_ERROR";
  readonly statusCode = 502; // Bad Gateway

  constructor(service: string, message?: string, cause?: Error) {
    super(message || `External service ${service} is unavailable`, cause);
  }
}
