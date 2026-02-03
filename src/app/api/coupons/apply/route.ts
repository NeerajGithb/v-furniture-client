import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { couponService } from "@/lib/domain/coupons/CouponService";
import { ApplyCouponSchema } from "@/lib/domain/coupons/CouponSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

// Apply coupon with validation
export const POST = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const body = await request.json();

        // Validate body at route boundary
        const { code, orderAmount } = ApplyCouponSchema.parse(body);

        const result = await couponService.applyCoupon(
          user.userId,
          code,
          orderAmount,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
