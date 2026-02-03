import { NextRequest, NextResponse } from "next/server";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { z } from "zod";

// Higher-order function to wrap route handlers with error handling
export function withRouteErrorHandling<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      // Handle Zod validation errors specifically
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

      // Let ApiResponseBuilder handle domain and infrastructure errors
      return ApiResponseBuilder.error(error as Error);
    }
  };
}
