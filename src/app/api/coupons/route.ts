import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { couponService } from "@/lib/domain/coupons/CouponService";
import {
  CreateCouponSchema,
  PaginationSchema,
} from "@/lib/domain/coupons/CouponSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

// Get all coupons with pagination
export const GET = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    // Validate pagination at route boundary
    const pagination = PaginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const result = await couponService.getAll(
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
  }),
);

// Create new coupon
export const POST = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const body = await request.json();

    // Validate body at route boundary
    const validatedData = CreateCouponSchema.parse(body);

    const result = await couponService.create(validatedData);
    return ApiResponseBuilder.success(result, 201);
  }),
);
