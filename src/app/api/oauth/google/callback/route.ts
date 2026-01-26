export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import {
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
} from '@/lib/security/auth';
import { getGoogleTokens, getGoogleUser } from '@/lib/google-auth';
import crypto from 'crypto';

export async function GET(req : Request) {
  try {
    /* 1️⃣ Read code from Google redirect */
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=missing_code', req.url)
      );
    }

    /* 2️⃣ Exchange code → Google tokens */
    const tokens = await getGoogleTokens(code);

    if (!tokens?.access_token) {
      return NextResponse.redirect(
        new URL('/login?error=token_exchange_failed', req.url)
      );
    }

    /* 3️⃣ Fetch Google user info */
    const googleUser = await getGoogleUser(tokens.access_token);
    const { email, name, picture } = googleUser || {};

    if (!email) {
      return NextResponse.redirect(
        new URL('/login?error=google_user_failed', req.url)
      );
    }

    /* 4️⃣ Connect DB */
    await connectDB();

    /* 5️⃣ Find or create user */
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || '',
        email,
        photoURL: picture || '',
        password: crypto.randomBytes(16).toString('hex'),
        hasOAuth: true,
      });
    } else {
      let shouldUpdate = false;

      if (!user.hasOAuth) {
        user.hasOAuth = true;
        shouldUpdate = true;
      }

      if (picture && user.photoURL !== picture) {
        user.photoURL = picture;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await user.save();
      }
    }

    /* 6️⃣ Create JWT tokens */
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    /* 7️⃣ Set cookies + redirect HOME */
    const res = NextResponse.redirect(new URL('/', req.url));
    setAuthCookies(res, accessToken, refreshToken);

    return res;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', req.url)
    );
  }
}