// Consistent API response format
import { NextResponse } from "next/server";
import { DomainError } from "../domain/shared/DomainError";
import { InfrastructureError } from "../domain/shared/InfrastructureError";
import { z } from "zod";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    context?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export class ApiResponseBuilder {
  static success<T>(
    data: T,
    statusCode: number = 200,
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: statusCode });
  }

  static error(
    error: DomainError | InfrastructureError | Error | string,
    statusCode?: number,
    requestId?: string,
  ): NextResponse<ApiResponse> {
    let errorResponse: ApiResponse;

    // Handle domain errors
    if (error instanceof DomainError) {
      errorResponse = {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          context: error.context,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
      return NextResponse.json(errorResponse, { status: error.statusCode });
    }

    // Handle infrastructure errors
    if (error instanceof InfrastructureError) {
      errorResponse = {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          context: { cause: error.cause?.message },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
      return NextResponse.json(errorResponse, { status: error.statusCode });
    }

    // Handle generic errors
    if (error instanceof Error) {
      errorResponse = {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error"
              : error.message,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
      return NextResponse.json(errorResponse, { status: statusCode || 500 });
    }

    // Handle string errors
    errorResponse = {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: typeof error === "string" ? error : "Unknown error occurred",
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    return NextResponse.json(errorResponse, { status: statusCode || 500 });
  }

  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    additionalData?: Record<string, any>,
    statusCode: number = 200,
  ): NextResponse<ApiResponse<{ items: T[]; pagination: typeof pagination } & Record<string, any>>> {
    const response: ApiResponse<{ items: T[]; pagination: typeof pagination } & Record<string, any>> =
      {
        success: true,
        data: {
          items: data,
          pagination,
          ...additionalData,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

    return NextResponse.json(response, { status: statusCode });
  }
}
