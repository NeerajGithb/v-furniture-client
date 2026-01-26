export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getVerificationOTPEmailHTML } from '@/lib/emailService';
import { getPendingRegistration, storePendingRegistration } from '@/lib/pendingRegistrations';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get pending registration
    const pending = await getPendingRegistration(email);

    if (!pending) {
      return NextResponse.json(
        { error: 'No pending registration found' },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update pending registration with new code
    await storePendingRegistration(email, {
      ...pending,
      verificationCode,
    });

    // Send verification email
    const html = getVerificationOTPEmailHTML(verificationCode, name || pending.name);
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - VFurniture',
      html,
      text: `Your verification code is: ${verificationCode}. This code expires in 10 minutes.`,
    });

    return NextResponse.json(
      { message: 'Verification code sent successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Send verification code error:', err);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}