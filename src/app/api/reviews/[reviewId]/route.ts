import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { reviewService } from "@/lib/domain/reviews/ReviewService";
import { ReviewIdSchema } from "@/lib/domain/reviews/ReviewSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const DELETE = withAuth(
  withDB(
    withRouteErrorHandling(
      async (
        request: NextRequest,
        user: AuthenticatedUser,
        { params }: { params: Promise<{ reviewId: string }> },
      ) => {
        const { reviewId } = await params;

        // Validate review ID at route boundary
        const validatedId = ReviewIdSchema.parse(reviewId);

        const result = await reviewService.deleteReview(
          user.userId,
          validatedId,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
