export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyEmailToken } from '@/lib/emailVerification';
import { auditLogger } from '@/lib/auditLog';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    const verification = verifyEmailToken(token);

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.expired ? 'Verification link has expired' : 'Invalid verification token' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: verification.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 200 });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    auditLogger.log({
      eventType: 'EMAIL_VERIFICATION',
      userId: user._id.toString(),
      email: user.email,
      success: true,
      message: 'Email verified successfully',
    });

    return NextResponse.json(
      { message: 'Email verified successfully. You can now log in.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Email verification error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}