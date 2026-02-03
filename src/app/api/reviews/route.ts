import { NextRequest } from "next/server";
import {
  withAuth,
  withOptionalAuth,
  AuthenticatedUser,
} from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { reviewService } from "@/lib/domain/reviews/ReviewService";
import {
  CreateReviewSchema,
  UpdateReviewSchema,
  ReviewQuerySchema,
  VoteReviewSchema,
  ReportReviewSchema,
} from "@/lib/domain/reviews/ReviewSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const GET = withOptionalAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser | null) => {
        const { searchParams } = new URL(request.url);

        // Validate query parameters at route boundary
        // searchParams.get() returns null for missing params, but Zod expects undefined
        const query = ReviewQuerySchema.parse({
          productId: searchParams.get("productId") ?? undefined,
          page: searchParams.get("page") ?? undefined,
          limit: searchParams.get("limit") ?? undefined,
          rating: searchParams.get("rating") ?? undefined,
          sort: searchParams.get("sort") ?? undefined,
        });

        // Service handles caching internally
        const result = await reviewService.getReviews(query, user?.userId);
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
        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action");

        if (action === "vote") {
          // Handle vote action
          const validatedData = VoteReviewSchema.parse(body);
          const result = await reviewService.voteOnReview(
            user.userId,
            validatedData,
          );
          return ApiResponseBuilder.success(result);
        } else if (action === "report") {
          // Handle report action
          const validatedData = ReportReviewSchema.parse(body);
          const result = await reviewService.reportReview(
            user.userId,
            validatedData,
          );
          return ApiResponseBuilder.success(result);
        } else {
          // Handle create review (default)
          const validatedData = CreateReviewSchema.parse(body);
          const result = await reviewService.createReview(
            user.userId,
            validatedData,
          );
          return ApiResponseBuilder.success(result, 201);
        }
      },
    ),
  ),
);

export const PATCH = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const body = await request.json();

        // Validate request body at route boundary
        const validatedData = UpdateReviewSchema.parse(body);

        const result = await reviewService.updateReview(
          user.userId,
          validatedData,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
