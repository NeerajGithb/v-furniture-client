import { NextRequest, NextResponse } from "next/server";
import {
  verifyAccessToken,
  verifyRefreshToken,
  createAccessToken,
} from "@/lib/security/auth";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser;
}

async function tryRefreshToken(
  request: NextRequest,
): Promise<{ user: AuthenticatedUser | null; newAccessToken?: string }> {
  try {
    const refreshToken = request.cookies.get("vf_refresh")?.value;
    if (!refreshToken) return { user: null };

    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded?.userId) return { user: null };

    const newAccessToken = createAccessToken({
      _id: decoded.userId,
      email: decoded.email,
    });

    return {
      user: {
        userId: decoded.userId,
        email: decoded.email,
      } as AuthenticatedUser,
      newAccessToken,
    };
  } catch {
    return { user: null };
  }
}

export async function authenticateUser(request: NextRequest): Promise<{
  user: AuthenticatedUser | null;
  error: NextResponse | null;
  newAccessToken?: string;
}> {
  try {
    const accessToken = request.cookies.get("vf_access")?.value;

    if (!accessToken) {
      const refreshResult = await tryRefreshToken(request);
      if (refreshResult.user) {
        return {
          user: refreshResult.user,
          error: null,
          newAccessToken: refreshResult.newAccessToken,
        };
      }

      return {
        user: null,
        error: NextResponse.json(
          { error: "Unauthorized", success: false },
          { status: 401 },
        ),
      };
    }

    const decoded = await verifyAccessToken(accessToken);

    if (!decoded?.userId) {
      const refreshResult = await tryRefreshToken(request);
      if (refreshResult.user) {
        return {
          user: refreshResult.user,
          error: null,
          newAccessToken: refreshResult.newAccessToken,
        };
      }

      return {
        user: null,
        error: NextResponse.json(
          { error: "Unauthorized", success: false },
          { status: 401 },
        ),
      };
    }

    return {
      user: decoded as AuthenticatedUser,
      error: null,
    };
  } catch (error) {
    const refreshResult = await tryRefreshToken(request);
    if (refreshResult.user) {
      return {
        user: refreshResult.user,
        error: null,
        newAccessToken: refreshResult.newAccessToken,
      };
    }

    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication failed", success: false },
        { status: 401 },
      ),
    };
  }
}

export function withAuth<T extends any[]>(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    ...args: T
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const { user, error, newAccessToken } = await authenticateUser(request);

    if (error) {
      return error;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", success: false },
        { status: 401 },
      );
    }

    const response = await handler(request, user, ...args);

    if (newAccessToken) {
      const isProduction = process.env.NODE_ENV === "production";
      response.cookies.set({
        name: "vf_access",
        value: newAccessToken,
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      });
    }

    return response;
  };
}

export async function optionalAuth(request: NextRequest): Promise<{
  user: AuthenticatedUser | null;
}> {
  try {
    const { user } = await authenticateUser(request);
    return { user };
  } catch {
    return { user: null };
  }
}

export function withOptionalAuth<T extends any[]>(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser | null,
    ...args: T
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const { user } = await optionalAuth(request);
    return handler(request, user, ...args);
  };
}
