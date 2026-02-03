import { NextRequest } from "next/server";
import { withOptionalAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { productsService } from "@/lib/domain/products/ProductsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { z } from "zod";

const ProductBySlugSchema = z.object({
  slug: z.string().min(1, "Product slug is required"),
});

export const GET = withOptionalAuth(
  withDB(
    withRouteErrorHandling(
      async (
        _request: NextRequest,
        user: AuthenticatedUser | null,
        { params }: { params: Promise<{ slug: string }> },
      ) => {
        const { slug } = await params;

        // Validate product slug at route boundary
        const validatedParams = ProductBySlugSchema.parse({ slug });

        const product = await productsService.getProductBySlug(
          validatedParams.slug,
        );
        return ApiResponseBuilder.success(product);
      },
    ),
  ),
);
