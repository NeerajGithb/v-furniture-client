// Email verification token management

import crypto from 'crypto';
import { sendEmail, getVerificationEmailHTML } from './emailService';

interface VerificationToken {
  token: string;
  email: string;
  expiresAt: number;
}

const verificationTokens = new Map<string, VerificationToken>();

// Clean up expired tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of verificationTokens.entries()) {
    if (now > data.expiresAt) {
      verificationTokens.delete(token);
    }
  }
}, 60 * 60 * 1000);

export function generateVerificationToken(email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  verificationTokens.set(token, {
    token,
    email,
    expiresAt,
  });
  
  return token;
}

export function verifyEmailToken(token: string): { valid: boolean; email?: string; expired?: boolean } {
  const record = verificationTokens.get(token);
  
  if (!record) {
    return { valid: false };
  }
  
  const now = Date.now();
  
  if (now > record.expiresAt) {
    verificationTokens.delete(token);
    return { valid: false, expired: true };
  }
  
  // Token is valid, delete it (one-time use)
  verificationTokens.delete(token);
  
  return {
    valid: true,
    email: record.email,
  };
}

export function deleteVerificationToken(token: string): void {
  verificationTokens.delete(token);
}

// Send verification email using real email service
export async function sendVerificationEmail(email: string, token: string, userName: string = 'User'): Promise<boolean> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
  
  const html = getVerificationEmailHTML(verificationUrl, userName);
  
  return await sendEmail({
    to: email,
    subject: 'Verify Your Email Address - VFurniture',
    html,
    text: `Hi ${userName},\n\nPlease verify your email by clicking this link: ${verificationUrl}\n\nThis link expires in 24 hours.`,
  });
}