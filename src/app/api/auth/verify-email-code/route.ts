export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import { createAccessToken, createRefreshToken, setAuthCookies } from '@/lib/security/auth';
import { getPendingRegistration, deletePendingRegistration } from '@/lib/pendingRegistrations';
import { logRegistration } from '@/lib/auditLog';

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

export async function POST(req: NextRequest) {
  const ipAddress = getClientIP(req);

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Get pending registration
    const pending = await getPendingRegistration(email);

    if (!pending) {
      return NextResponse.json(
        { error: 'No pending registration found or code expired' },
        { status: 400 }
      );
    }

    // Verify code
    if (pending.verificationCode !== code.trim()) {
      console.log('❌ Code mismatch. Expected:', pending.verificationCode, 'Got:', code.trim());
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user was created in the meantime
    const existing = await User.findOne({ email });
    if (existing) {
      await deletePendingRegistration(email);
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create the user NOW (after OTP verification)
    const newUser = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      photoURL: pending.photoURL || '',
      hasOAuth: false,
      emailVerified: true, // Already verified via OTP
      lastLoginIP: ipAddress,
    });

    // Delete pending registration
    await deletePendingRegistration(email);

    // Log registration
    logRegistration(newUser._id.toString(), newUser.email, ipAddress, pending.userAgent);

    // Create tokens and set cookies
    const accessToken = createAccessToken(newUser);
    const refreshToken = createRefreshToken(newUser);

    const res = NextResponse.json(
      {
        message: 'Email verified and account created successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 200 }
    );

    setAuthCookies(res, accessToken, refreshToken);

    return res;
  } catch (err) {
    console.error('Verify email code error:', err);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}