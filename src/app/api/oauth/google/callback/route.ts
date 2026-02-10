import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { oauthService } from "@/lib/domain/oauth/OAuthService";
import { setAuthCookies } from "@/lib/security/auth";

export const GET = withDB(async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url);

  // Extract callback parameters from Google
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors from Google
  if (error) {
    const loginUrl = new URL("/auth/login", origin);
    loginUrl.searchParams.set(
      "error",
      `OAuth error: ${error}${errorDescription ? ` - ${errorDescription}` : ""}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  // Code is required for callback
  if (!code) {
    const loginUrl = new URL("/auth/login", origin);
    loginUrl.searchParams.set("error", "Authorization code missing");
    return NextResponse.redirect(loginUrl);
  }

  // Process callback with authorization code
  const result = await oauthService.handleOAuth({
    provider: "google",
    action: "callback",
    code,
    error: error || undefined,
    error_description: errorDescription || undefined,
  });

  if (result.type === "auth") {
    // Success - set auth cookies and redirect home
    const response = NextResponse.redirect(new URL("/", origin));
    setAuthCookies(
      response,
      result.tokens.accessToken,
      result.tokens.refreshToken,
    );
    return response;
  }

  // Fallback error
  const loginUrl = new URL("/auth/login", origin);
  loginUrl.searchParams.set("error", "oauth_callback_failed");
  return NextResponse.redirect(loginUrl);
});
