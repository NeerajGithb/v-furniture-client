import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { paymentService } from "@/lib/domain/payment/PaymentService";
import {
  CreatePaymentSchema,
  VerifyPaymentSchema,
  PaymentQuerySchema,
} from "@/lib/domain/payment/PaymentSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { checkPaymentRateLimit } from "@/lib/security/rateLimit";

export const POST = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        // Apply rate limiting
        const rateLimitResponse = checkPaymentRateLimit(request, user);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }

        const body = await request.json();

        // Validate request body at route boundary
        const validatedData = CreatePaymentSchema.parse(body);

        const result = await paymentService.createPayment(
          user.userId,
          validatedData,
          user.email,
        );
        return ApiResponseBuilder.success(result, 201);
      },
    ),
  ),
);

export const PUT = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const body = await request.json();

        // Validate request body at route boundary
        const validatedData = VerifyPaymentSchema.parse(body);

        const result = await paymentService.verifyPayment(
          user.userId,
          validatedData,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);

export const GET = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const { searchParams } = new URL(request.url);

        // Validate query parameters at route boundary
        const query = PaymentQuerySchema.parse({
          paymentId: searchParams.get("paymentId"),
          orderId: searchParams.get("orderId"),
        });

        // Service handles caching internally
        const result = await paymentService.getPaymentStatus(
          user.userId,
          query.paymentId,
          query.orderId,
        );

        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
