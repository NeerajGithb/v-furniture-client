import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { wishlistService } from "@/lib/domain/wishlist/WishlistService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { BatchRemoveFromWishlistSchema } from "@/lib/domain/wishlist/WishlistSchemas";

export const DELETE = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const body = await request.json();

        // Validate body at route boundary
        const validatedData = BatchRemoveFromWishlistSchema.parse(body);

        const result = await wishlistService.batchRemoveFromWishlist(
          user.userId,
          validatedData,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
