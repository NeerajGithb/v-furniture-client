import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { couponService } from "@/lib/domain/coupons/CouponService";
import {
  UpdateCouponSchema,
  CouponIdSchema,
} from "@/lib/domain/coupons/CouponSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

// Get coupon by ID
export const GET = withDB(
  withRouteErrorHandling(
    async (
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await params;
      const validatedId = CouponIdSchema.parse(id);

      const result = await couponService.getById(validatedId);
      return ApiResponseBuilder.success(result);
    },
  ),
);

// Update coupon
export const PUT = withDB(
  withRouteErrorHandling(
    async (
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await params;
      const body = await request.json();

      const validatedId = CouponIdSchema.parse(id);
      const validatedData = UpdateCouponSchema.parse(body);

      const result = await couponService.update(validatedId, validatedData);
      return ApiResponseBuilder.success(result);
    },
  ),
);

// Delete coupon
export const DELETE = withDB(
  withRouteErrorHandling(
    async (
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await params;
      const validatedId = CouponIdSchema.parse(id);

      const result = await couponService.delete(validatedId);
      return ApiResponseBuilder.success(result);
    },
  ),
);
