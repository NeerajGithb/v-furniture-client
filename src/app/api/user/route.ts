import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { userService } from "@/lib/domain/user/UserService";
import {
  UpdateUserProfileSchema,
  UserQuerySchema,
} from "@/lib/domain/user/UserSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const GET = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const { searchParams } = new URL(request.url);

        // Validate query parameters at route boundary
        const query = UserQuerySchema.parse({
          action: searchParams.get("action") as "profile" | "counts" | null,
        });

        // Default to profile if no action specified
        const action = query.action || "profile";

        if (action === "counts") {
          // Service handles caching internally
          const result = await userService.getCounts(user.userId);
          return ApiResponseBuilder.success(result);
        }

        // Default: get profile
        // Service handles caching internally
        const result = await userService.getProfile(user.userId);
        return ApiResponseBuilder.success(result);
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
        const validatedData = UpdateUserProfileSchema.parse(body);

        const result = await userService.updateProfile(
          user.userId,
          validatedData,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
