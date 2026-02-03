import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { authService } from "@/lib/domain/auth/AuthService";
import {
  LoginSchema,
  RegisterSchema,
  VerifyEmailCodeSchema,
  SendResetCodeSchema,
  VerifyResetCodeSchema,
  ResetPasswordSchema,
  ResendOTPSchema,
} from "@/lib/domain/auth/AuthSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import {
  setAuthCookies,
  clearAuthCookies,
  getAccessTokenFromCookie,
} from "@/lib/security/auth";

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  return forwarded?.split(",")[0] || realIP || "unknown";
}

// Login endpoint with enhanced error handling
export const POST = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "unknown";
    const body = await request.json();

    switch (action) {
      case "login": {
        const validatedData = LoginSchema.parse(body);
        const result = await authService.login(
          validatedData,
          ipAddress,
          userAgent,
        );

        const response = ApiResponseBuilder.success({
          message: result.message,
          user: result.user,
        });

        setAuthCookies(
          response,
          result.tokens.accessToken,
          result.tokens.refreshToken,
        );
        return response;
      }

      case "register": {
        const validatedData = RegisterSchema.parse(body);
        const result = await authService.register(
          validatedData,
          ipAddress,
          userAgent,
        );

        if (result.tokens) {
          const response = ApiResponseBuilder.success(result, 201);
          setAuthCookies(
            response,
            result.tokens.accessToken,
            result.tokens.refreshToken,
          );
          return response;
        }

        return ApiResponseBuilder.success(result);
      }

      case "verify-email": {
        const validatedData = VerifyEmailCodeSchema.parse(body);
        const result = await authService.verifyEmailCode(
          validatedData,
          ipAddress,
        );

        const response = ApiResponseBuilder.success({
          message: result.message,
          user: result.user,
        });

        setAuthCookies(
          response,
          result.tokens.accessToken,
          result.tokens.refreshToken,
        );
        return response;
      }

      case "send-reset-code": {
        const validatedData = SendResetCodeSchema.parse(body);
        const result = await authService.sendResetCode(validatedData);
        return ApiResponseBuilder.success(result);
      }

      case "verify-reset-code": {
        const validatedData = VerifyResetCodeSchema.parse(body);
        const result = await authService.verifyResetCode(validatedData);
        return ApiResponseBuilder.success(result);
      }

      case "reset-password": {
        const validatedData = ResetPasswordSchema.parse(body);
        const result = await authService.resetPassword(validatedData);
        return ApiResponseBuilder.success(result);
      }

      case "resend-otp": {
        const validatedData = ResendOTPSchema.parse(body);
        const result = await authService.resendOTP(validatedData);
        return ApiResponseBuilder.success(result);
      }

      case "logout": {
        const accessToken = await getAccessTokenFromCookie(request);

        if (!accessToken) {
          return ApiResponseBuilder.error("No active session to logout", 401);
        }

        const result = await authService.logout(accessToken);

        const response = ApiResponseBuilder.success({
          success: result.success,
          message: result.message,
        });

        clearAuthCookies(response);
        return response;
      }

      default:
        return ApiResponseBuilder.error("Invalid action parameter", 400);
    }
  }),
);
