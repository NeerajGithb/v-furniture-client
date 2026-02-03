import { NextRequest } from "next/server";
import { withOptionalAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { productsService } from "@/lib/domain/products/ProductsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { ProductsQuerySchema } from "@/lib/domain/products/ProductsSchemas";

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
        const validatedQuery = ProductsQuerySchema.parse(queryParams);

        const result = await productsService.getProducts(validatedQuery);

        // Handle different response types
        if (validatedQuery.count) {
          return ApiResponseBuilder.success(result);
        }

        if (validatedQuery.showcase) {
          return ApiResponseBuilder.success(result);
        }

        if (validatedQuery.groupBy === "category") {
          return ApiResponseBuilder.success(result);
        }

        // Default: paginated products list
        if (result.pagination) {
          return ApiResponseBuilder.paginated(
            result.products,
            result.pagination,
            result.filters ? { 
              filters: result.filters,
              ...(result.fallback && { fallback: result.fallback })
            } : result.fallback ? { fallback: result.fallback } : undefined
          );
        }

        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
