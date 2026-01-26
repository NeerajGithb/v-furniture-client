export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import { createAccessToken, createRefreshToken, setAuthCookies } from '@/lib/security/auth';
import { checkLoginRateLimit } from '@/lib/security/rateLimit';
import { isAccountLocked, recordFailedLogin, resetFailedAttempts } from '@/lib/accountSecurity';
import { logLoginSuccess, logLoginFailed, logAccountLocked } from '@/lib/auditLog';
import bcrypt from 'bcrypt';

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

export async function POST(req: NextRequest) {
  const ipAddress = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Apply rate limiting
    const rateLimitCheck = checkLoginRateLimit(ipAddress, email);
    if (!rateLimitCheck.success) {
      logLoginFailed(email, `Rate limit exceeded`, ipAddress, userAgent);
      return NextResponse.json(
        { error: rateLimitCheck.message },
        { status: 429 }
      );
    }

    // Check if account is locked
    const lockStatus = isAccountLocked(email);
    if (lockStatus.locked) {
      const minutes = Math.ceil((lockStatus.remainingTime || 0) / 60);
      logAccountLocked(email, `Account locked. ${minutes} minutes remaining`, ipAddress);
      return NextResponse.json(
        { error: `Account is locked due to too many failed login attempts. Try again in ${minutes} minutes.` },
        { status: 423 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      recordFailedLogin(email);
      logLoginFailed(email, 'User not found', ipAddress, userAgent);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const failedResult = recordFailedLogin(email);
      logLoginFailed(email, `Incorrect password. ${failedResult.remainingAttempts} attempts remaining`, ipAddress, userAgent);
      
      if (failedResult.locked) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Account locked for 30 minutes.' },
          { status: 423 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          remainingAttempts: failedResult.remainingAttempts 
        },
        { status: 401 }
      );
    }

    // Check if email is verified (skip for OAuth users)
    if (!user.hasOAuth && !user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in', requiresVerification: true },
        { status: 403 }
      );
    }

    // Successful login - reset failed attempts
    resetFailedAttempts(email);

    // Update last login info
    user.lastLoginAt = new Date();
    user.lastLoginIP = ipAddress;
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    await user.save();

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    logLoginSuccess(user._id.toString(), user.email, ipAddress, userAgent);

    const res = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 },
    );

    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (err) {
    console.error('Login error:', err);
    logLoginFailed('unknown', 'Internal server error', ipAddress, userAgent);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}