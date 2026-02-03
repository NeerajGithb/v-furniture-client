import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { authService } from "@/lib/domain/auth/AuthService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { setAuthCookies, clearAuthCookies } from "@/lib/security/auth";
import { cookies } from "next/headers";

// Refresh authentication tokens
export const POST = withDB(
  withRouteErrorHandling(async (_request: NextRequest) => {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("vf_refresh")?.value;

    if (!refreshToken) {
      const response = ApiResponseBuilder.error("No refresh token", 401);
      clearAuthCookies(response);
      return response;
    }

    const tokens = await authService.refreshTokens(refreshToken);

    const response = ApiResponseBuilder.success({
      success: true,
      message: "Tokens refreshed successfully",
    });

    setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
    return response;
  }),
);
