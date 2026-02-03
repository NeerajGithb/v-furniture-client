import { NextRequest } from "next/server";
import { withOptionalAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { inspirationsService } from "@/lib/domain/inspirations/InspirationsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { InspirationBySlugSchema } from "@/lib/domain/inspirations/InspirationsSchemas";

export const GET = withOptionalAuth(
  withDB(
    withRouteErrorHandling(
      async (
        _request: NextRequest,
        user: AuthenticatedUser | null,
        { params }: { params: Promise<{ slug: string }> },
      ) => {
        const { slug } = await params;

        // Validate slug at route boundary
        const validatedParams = InspirationBySlugSchema.parse({ slug });

        const inspiration = await inspirationsService.getInspirationBySlug(
          validatedParams.slug,
        );
        return ApiResponseBuilder.success(inspiration);
      },
    ),
  ),
);
