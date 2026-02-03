import { NextRequest } from "next/server";
import { withOptionalAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { inspirationsService } from "@/lib/domain/inspirations/InspirationsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { InspirationsQuerySchema } from "@/lib/domain/inspirations/InspirationsSchemas";

export const GET = withOptionalAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser | null) => {
        const { searchParams } = new URL(request.url);

        // Convert searchParams to object for Zod validation
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        // Validate query parameters at route boundary
        const validatedQuery = InspirationsQuerySchema.parse(queryParams);

        const result =
          await inspirationsService.getInspirations(validatedQuery);

        // Handle different response types
        if (validatedQuery.relatedProducts) {
          return ApiResponseBuilder.success(result);
        }

        // Default: paginated inspirations list
        return ApiResponseBuilder.paginated(
          result.inspirations,
          result.pagination,
        );
      },
    ),
  ),
);
