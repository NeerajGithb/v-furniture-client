import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/dbConnect';
import crypto from 'crypto';
import { sendEmail, getPasswordResetEmailHTML } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  await connectDB();

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'No user with this email' }, { status: 404 });
  }

  const name = user.name || 'there';
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

  user.resetCode = hashedCode;
  user.resetCodeExpires = expires;

  user.markModified('resetCode');
  user.markModified('resetCodeExpires');

  try {
    await user.save();

    if (!user.resetCode || !user.resetCodeExpires) {
      console.warn('⚠️ Reset code or expiration not saved properly.');
    }
  } catch (err) {
    console.error('❌ Error saving user with reset code:', err);
    return NextResponse.json({ error: 'Failed to save reset code' }, { status: 500 });
  }

  const firstName = name?.split(' ')[0] || 'there';

  // Use unified email service with custom template for reset code
  const emailHTML = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #000;">VFurniture</h2>
      <p style="font-size: 16px;">Hi ${firstName},</p>
      <p style="font-size: 15px; line-height: 1.6;">
        We received a request to reset your password. Use the 6-digit code below to proceed:
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 28px; letter-spacing: 4px; font-weight: bold; color: #111;">${code}</span>
      </div>
      <p style="font-size: 14px; line-height: 1.5;">
        This code is valid for <strong>10 minutes</strong>. If you didn't request this, you can safely ignore the email or secure your account.
      </p>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 13px; color: #777;">
        Need help? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #555;">${process.env.EMAIL_USER}</a>
      </p>
      <p style="font-size: 12px; color: #aaa;">© ${new Date().getFullYear()} VFurniture. All rights reserved.</p>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: 'Reset your VFurniture password',
      html: emailHTML,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to send reset code email:', err);
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
  }
}