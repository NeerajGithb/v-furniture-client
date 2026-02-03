import { NextRequest } from "next/server";
import { withOptionalAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { productsService } from "@/lib/domain/products/ProductsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { ProductByIdSchema } from "@/lib/domain/products/ProductsSchemas";

export const GET = withOptionalAuth(
  withDB(
    withRouteErrorHandling(
      async (
        _request: NextRequest,
        user: AuthenticatedUser | null,
        { params }: { params: Promise<{ id: string }> },
      ) => {
        const { id } = await params;

        // Validate product ID at route boundary
        const validatedParams = ProductByIdSchema.parse({ id });

        const product = await productsService.getProductById(
          validatedParams.id,
        );
        return ApiResponseBuilder.success(product);
      },
    ),
  ),
);
