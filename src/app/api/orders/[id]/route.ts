import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { orderService } from "@/lib/domain/orders/OrderService";
import {
  OrderIdSchema,
  UpdateOrderSchema,
} from "@/lib/domain/orders/OrderSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export const GET = withAuth(
  withDB(
    withRouteErrorHandling(
      async (
        request: NextRequest,
        user: AuthenticatedUser,
        { params }: RouteParams,
      ) => {
        const { id } = await params;
        const { searchParams } = new URL(request.url);

        // Check if this is a lookup by order number
        const lookup = searchParams.get("lookup");

        // Validate ID at route boundary
        const validatedId = OrderIdSchema.parse(id);

        // Get order by ID or order number
        const result =
          lookup === "orderNumber"
            ? await orderService.getOrderByNumber(user.userId, validatedId)
            : await orderService.getOrderById(user.userId, validatedId);

        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);

export const PUT = withAuth(
  withDB(
    withRouteErrorHandling(
      async (
        request: NextRequest,
        user: AuthenticatedUser,
        { params }: RouteParams,
      ) => {
        const { id } = await params;
        const body = await request.json();

        // Validate ID and body at route boundary
        const validatedId = OrderIdSchema.parse(id);
        const validatedData = UpdateOrderSchema.parse(body);

        const result = await orderService.updateOrder(
          user.userId,
          validatedId,
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
      async (
        request: NextRequest,
        user: AuthenticatedUser,
        { params }: RouteParams,
      ) => {
        const { id } = await params;
        const validatedId = OrderIdSchema.parse(id);
        const isOrderNumber = validatedId.startsWith("OD-");
        
        let result;
        if (isOrderNumber) {
          const orderResult = await orderService.getOrderByNumber(user.userId, validatedId);
          if (!orderResult?.order?._id) {
            throw new Error("Order not found");
          }
          result = await orderService.deleteOrder(user.userId, orderResult.order._id);
        } else {
          result = await orderService.deleteOrder(user.userId, validatedId);
        }
        
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
