import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { authService } from "@/lib/domain/auth/AuthService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { cookies } from "next/headers";

// Get current authenticated user
export const GET = withDB(
  withRouteErrorHandling(async (_request: NextRequest) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("vf_access")?.value;

    if (!token) {
      return ApiResponseBuilder.error("Access token missing", 401);
    }

    const result = await authService.getCurrentUser(token);
    return ApiResponseBuilder.success(result);
  }),
);
