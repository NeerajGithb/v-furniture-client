import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { cartService } from "@/lib/domain/cart/CartService";
import {
  AddToCartSchema,
  UpdateCartSchema,
  RemoveFromCartSchema,
  CheckProductsSchema,
} from "@/lib/domain/cart/CartSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const GET = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const { searchParams } = new URL(request.url);
        const checkProducts = searchParams.get("check");

        if (checkProducts) {
          const productIds = checkProducts.split(",").filter(Boolean);

          // Validate at route boundary
          const validatedData = CheckProductsSchema.parse({ productIds });

          const result = await cartService.checkProductsInCart(
            user.userId,
            validatedData,
          );
          return ApiResponseBuilder.success(result);
        }

        const result = await cartService.getUserCart(user.userId);
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);

export const POST = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const body = await request.json();

        // Validate at route boundary
        const validatedData = AddToCartSchema.parse(body);

        const result = await cartService.addToCart(user.userId, validatedData);
        return ApiResponseBuilder.success(result, 201);
      },
    ),
  ),
);

export const PATCH = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const body = await request.json();

        // Validate at route boundary
        const validatedData = UpdateCartSchema.parse(body);

        const result = await cartService.updateCartItem(
          user.userId,
          validatedData,
        );
        return ApiResponseBuilder.success(result);
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

        // Validate at route boundary
        const validatedData = RemoveFromCartSchema.parse({
          productId,
          clearAll,
        });

        const result = await cartService.removeFromCart(
          user.userId,
          validatedData,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
