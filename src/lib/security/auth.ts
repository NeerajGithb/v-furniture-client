export const runtime = 'nodejs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN_NAME = 'vf_access';
const REFRESH_TOKEN_NAME = 'vf_refresh';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('Missing JWT secret(s)');
}

const isProduction = process.env.NODE_ENV === 'production';

interface User {
  _id: { toString: () => string } | string;
  email: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const createAccessToken = (user: User): string =>
  jwt.sign(
    { userId: user._id.toString(), email: user.email },
    JWT_SECRET!,
    { expiresIn: '15m' }
  );

export const createRefreshToken = (user: User): string =>
  jwt.sign(
    { userId: user._id.toString(), email: user.email },
    JWT_REFRESH_SECRET!,
    { expiresIn: '30d' }
  );

export const verifyAccessToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    return jwt.verify(token, JWT_SECRET!) as TokenPayload;
  } catch (error) {
    console.error('Access token verification failed:', error);
    return null;
  }
};

export const verifyRefreshToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET!) as TokenPayload;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
};

export const getAccessTokenFromCookie = async (req?: NextRequest): Promise<string | null> => {
  try {
    if (req?.cookies) return req.cookies.get(ACCESS_TOKEN_NAME)?.value || null;
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_NAME)?.value || null;
  } catch {
    return null;
  }
};

export const getRefreshTokenFromCookie = async (req?: NextRequest): Promise<string | null> => {
  try {
    if (req?.cookies) return req.cookies.get(REFRESH_TOKEN_NAME)?.value || null;
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_NAME)?.value || null;
  } catch {
    return null;
  }
};

export const getCurrentUser = async (req?: NextRequest): Promise<TokenPayload | null> => {
  const accessToken = await getAccessTokenFromCookie(req);
  if (!accessToken) return null;
  return await verifyAccessToken(accessToken);
};

export const setAuthCookies = (response: NextResponse, accessToken: string, refreshToken: string): void => {
  response.cookies.set({
    name: ACCESS_TOKEN_NAME,
    value: accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  response.cookies.set({
    name: REFRESH_TOKEN_NAME,
    value: refreshToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
};

export const clearAuthCookies = (response: NextResponse): void => {
  response.cookies.set({
    name: ACCESS_TOKEN_NAME,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: REFRESH_TOKEN_NAME,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
};