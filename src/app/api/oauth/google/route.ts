import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { oauthService } from "@/lib/domain/oauth/OAuthService";

export const GET = withDB(async (request: NextRequest) => {
  const { origin } = new URL(request.url);

  // Simple initiation - just get Google auth URL and redirect
  const result = await oauthService.handleOAuth({
    provider: "google",
    action: "initiate",
  });

  if (result.type === "redirect") {
    return NextResponse.redirect(result.url);
  }

  // Fallback error
  const loginUrl = new URL("/auth/login", origin);
  loginUrl.searchParams.set("error", "oauth_initiation_failed");
  return NextResponse.redirect(loginUrl);
});
