import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { wishlistService } from "@/lib/domain/wishlist/WishlistService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import {
  AddToWishlistSchema,
  RemoveFromWishlistSchema,
  CheckWishlistSchema,
  PaginationSchema,
} from "@/lib/domain/wishlist/WishlistSchemas";

export const GET = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const { searchParams } = new URL(request.url);
        const checkProducts = searchParams.get("check");

        if (checkProducts) {
          const productIds = checkProducts.split(",").filter(Boolean);

          // Validate with Zod at route boundary
          const validatedData = CheckWishlistSchema.parse({ productIds });

          const result = await wishlistService.checkProductsInWishlist(
            user.userId,
            validatedData,
          );
          return ApiResponseBuilder.success(result);
        }

        // Validate pagination at route boundary
        const pagination = PaginationSchema.parse({
          page: searchParams.get("page"),
          limit: searchParams.get("limit"),
        });

        const result = await wishlistService.getUserWishlist(
          user.userId,
          pagination.page,
          pagination.limit,
        );

        // Transform pagination format for ApiResponseBuilder
        const paginationMeta = {
          page: result.pagination.currentPage,
          limit: pagination.limit,
          total: result.pagination.totalItems,
          totalPages: result.pagination.totalPages,
        };

        return ApiResponseBuilder.paginated(result.items, paginationMeta);
      },
    ),
  ),
);

export const POST = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const body = await request.json();

        // Validate body at route boundary
        const validatedData = AddToWishlistSchema.parse(body);

        const result = await wishlistService.addToWishlist(
          user.userId,
          validatedData,
        );
        return ApiResponseBuilder.success(result, 201);
      },
    ),
  ),
);

export const DELETE = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");
        const clearAll = searchParams.get("clearAll") === "true";

        // Validate data at route boundary
        const validatedData = RemoveFromWishlistSchema.parse({
          productId,
          clearAll,
        });

        const result = await wishlistService.removeFromWishlist(
          user.userId,
          validatedData,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
