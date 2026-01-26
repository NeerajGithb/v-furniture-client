export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import { createAccessToken, createRefreshToken, setAuthCookies } from '@/lib/security/auth';
import { formatUserData } from '@/utils/formatters';
import { validatePassword } from '@/lib/passwordValidator';
import { checkRegisterRateLimit } from '@/lib/security/rateLimit';
import { logRegistration } from '@/lib/auditLog';
import { sendEmail, getVerificationOTPEmailHTML } from '@/lib/emailService';
import { storePendingRegistration } from '@/lib/pendingRegistrations';
import crypto from 'crypto';

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

export async function POST(req: NextRequest) {
  const ipAddress = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    const raw = await req.json();
    const { uid, photoURL } = raw;
    const { name, email, password } = formatUserData(raw);

    if (!name || !email || (!password && !uid)) {
      return NextResponse.json(
        { error: 'Name, email, and password (or OAuth UID) are required' },
        { status: 400 },
      );
    }

    // Apply rate limiting
    const rateLimitCheck = checkRegisterRateLimit(ipAddress);
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }

    // Validate password strength (skip for OAuth)
    if (!uid && password) {
      const validation = validatePassword(password);
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Password does not meet requirements', errors: validation.errors },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists. Try logging in instead.' },
        { status: 409 },
      );
    }

    // For OAuth users, create user immediately (they're pre-verified)
    if (uid) {
      const newUser = await User.create({
        name,
        email,
        password: crypto.randomBytes(16).toString('hex'),
        photoURL: photoURL || '',
        hasOAuth: true,
        emailVerified: true,
        lastLoginIP: ipAddress,
      });

      const accessToken = createAccessToken(newUser);
      const refreshToken = createRefreshToken(newUser);

      logRegistration(newUser._id.toString(), newUser.email, ipAddress, userAgent);

      const res = NextResponse.json(
        {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          slug: newUser.slug,
          requiresVerification: false,
          message: 'Registration successful',
        },
        { status: 201 },
      );

      setAuthCookies(res, accessToken, refreshToken);
      return res;
    }

    // For email/password users, store pending registration and send OTP
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store pending registration (not creating user yet)
    storePendingRegistration(email, {
      name,
      email,
      password,
      photoURL: photoURL || '',
      hasOAuth: false,
      verificationCode,
      ipAddress,
      userAgent,
    });

    // Send verification email with OTP
    const html = getVerificationOTPEmailHTML(verificationCode, name);
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - VFurniture',
      html,
      text: `Your verification code is: ${verificationCode}. This code expires in 10 minutes.`,
    });

    return NextResponse.json(
      {
        email,
        name,
        requiresVerification: true,
        message: 'Verification code sent. Please check your email.',
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error('Registration error:', err);

    if (err.code === 11000) {
      if (err.keyPattern?.email) {
        return NextResponse.json(
          { error: 'Email already exists. Try logging in instead.' },
          { status: 409 },
        );
      }
      if (err.keyPattern?.slug) {
        return NextResponse.json({ error: 'Slug conflict. Try again.' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}