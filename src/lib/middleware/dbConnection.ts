// Database connection middleware
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { InfrastructureError } from "@/lib/domain/shared/InfrastructureError";
import { DomainError } from "@/lib/domain/shared/DomainError";

type Handler<T extends any[]> = (...args: T) => Promise<NextResponse>;

export function withDB<T extends any[]>(handler: Handler<T>): Handler<T> {
  return async (...args: T): Promise<NextResponse> => {
    try {
      // Ensure database connection before processing request
      await connectDB();
      return await handler(...args);
    } catch (error) {
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

      // Handle infrastructure errors (system-level failures)
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

      // Handle generic errors (unexpected errors)
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

      // Handle unknown errors
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 Unknown Error:", error);
      }
      return ApiResponseBuilder.error("An unexpected error occurred", 500);
    }
  };
}
