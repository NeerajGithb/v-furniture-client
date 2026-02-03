// lib/google-auth.ts

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export const getGoogleAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

export const getGoogleTokens = async (code: string): Promise<GoogleTokens> => {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Google token exchange failed: ${res.status} ${res.statusText}`,
    );
  }

  const tokens = await res.json();

  if (tokens.error) {
    throw new Error(
      `Google OAuth error: ${tokens.error}${tokens.error_description ? ` - ${tokens.error_description}` : ""}`,
    );
  }

  return tokens;
};

export const getGoogleUser = async (
  accessToken: string,
): Promise<GoogleUser> => {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(
      `Google user info fetch failed: ${res.status} ${res.statusText}`,
    );
  }

  const user = await res.json();

  if (user.error) {
    throw new Error(
      `Google user info error: ${user.error}${user.error_description ? ` - ${user.error_description}` : ""}`,
    );
  }

  return user;
};
