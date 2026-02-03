import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { orderService } from "@/lib/domain/orders/OrderService";
import {
  CreateOrderSchema,
  OrderQuerySchema,
} from "@/lib/domain/orders/OrderSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { checkOrderRateLimit } from "@/lib/security/rateLimit";

export const GET = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const { searchParams } = new URL(request.url);

        // Validate query parameters at route boundary
        // searchParams.get() returns null for missing params, but Zod expects undefined
        const query = OrderQuerySchema.parse({
          page: searchParams.get("page") ?? undefined,
          limit: searchParams.get("limit") ?? undefined,
          status: searchParams.get("status") ?? undefined,
          orderNumber: searchParams.get("orderNumber") ?? undefined,
        });

        const result = await orderService.getOrders(
          user.userId,
          query.page,
          query.limit,
          query.status,
          query.orderNumber,
        );

        // Transform pagination format for ApiResponseBuilder
        const paginationMeta = {
          page: result.pagination.currentPage,
          limit: query.limit,
          total: result.pagination.totalItems,
          totalPages: result.pagination.totalPages,
        };

        return ApiResponseBuilder.paginated(result.orders, paginationMeta);
      },
    ),
  ),
);

export const POST = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        // Apply rate limiting
        const rateLimitResponse = checkOrderRateLimit(request, user);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }

        const body = await request.json();

        // Validate request body at route boundary
        const validatedData = CreateOrderSchema.parse(body);

        const result = await orderService.createOrder(
          user.userId,
          validatedData,
        );
        return ApiResponseBuilder.success(result, 201);
      },
    ),
  ),
);
