import { NextRequest, NextResponse } from "next/server";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { z } from "zod";
import { DomainError } from "@/lib/domain/shared/DomainError";
import { InfrastructureError } from "@/lib/domain/shared/InfrastructureError";

// Higher-order function to wrap route handlers with error handling
export function withRouteErrorHandling<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
          ...("received" in issue && { received: issue.received }),
        }));

        const errorMessages = issues.map((issue) => issue.message);

        const response = {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: errorMessages.join(". "),
            context: { issues },
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        };

        return NextResponse.json(response, { status: 400 });
      }

      // Handle domain errors (business logic errors)
      if (error instanceof DomainError) {
        if (process.env.NODE_ENV === "development") {
          console.error("🔴 Domain Error:", {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode,
            stack: error.stack,
          });
        }
        return ApiResponseBuilder.error(error);
      }

      // Handle infrastructure errors (database, external services, etc.)
      if (error instanceof InfrastructureError) {
        if (process.env.NODE_ENV === "development") {
          console.error("🔴 Infrastructure Error:", {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode,
            stack: error.stack,
          });
        }
        return ApiResponseBuilder.error(error);
      }

      // Handle generic Error instances
      if (error instanceof Error) {
        if (process.env.NODE_ENV === "development") {
          console.error("🔴 Generic Error:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        }
        return ApiResponseBuilder.error(error);
      }

      // Handle unknown/non-Error types
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 Unknown Error:", error);
      }
      return ApiResponseBuilder.error(
        new Error("An unexpected error occurred"),
        500,
      );
    }
  };
}