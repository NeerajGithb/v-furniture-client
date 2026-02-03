import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const CLIENT_URL =
  process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
const APP_NAME = "VFurniture";
const SENDER_NAME = "VFurniture Support";

if (!EMAIL_USER || !EMAIL_PASS) {
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

if (EMAIL_USER && EMAIL_PASS) {
  transporter.verify((error) => {
    if (error) {
    }
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!EMAIL_USER || !EMAIL_PASS) {
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return true;
  } catch (error) {
    return false;
  }
}

export function getVerificationEmailHTML(
  verificationUrl: string,
  userName: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your Email</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dddddd;">
          
          <tr>
            <td style="padding:30px 40px;border-bottom:2px solid #000000;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#000000;letter-spacing:-0.5px;">${APP_NAME}</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding:40px 40px 20px 40px;">
              <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#000000;">Verify Your Email Address</h2>
              <p style="margin:0 0 15px 0;font-size:15px;line-height:1.6;color:#333333;">Hi ${userName},</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#666666;">Thank you for registering with ${APP_NAME}. To complete your registration, please verify your email address by clicking the button below.</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:20px 40px 40px 40px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#000000;">
                    <a href="${verificationUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;letter-spacing:0.5px;" target="_blank">VERIFY EMAIL</a>
                  </td>
                </tr>
              </table>
              <p style="margin:30px 0 0 0;font-size:13px;color:#999999;line-height:1.6;">
                Or copy this link:<br>
                <a href="${verificationUrl}" style="color:#666666;word-break:break-all;">${verificationUrl}</a>
              </p>
              <p style="margin:15px 0 0 0;font-size:13px;color:#999999;">This link expires in 24 hours.</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:30px 40px;background-color:#f9f9f9;border-top:1px solid #dddddd;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#666666;text-align:center;">If you didn't create an account, you can ignore this email.</p>
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getPasswordResetEmailHTML(
  resetUrl: string,
  userName: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dddddd;">
          
          <tr>
            <td style="padding:30px 40px;border-bottom:2px solid #000000;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#000000;letter-spacing:-0.5px;">${APP_NAME}</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding:40px 40px 20px 40px;">
              <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#000000;">Reset Your Password</h2>
              <p style="margin:0 0 15px 0;font-size:15px;line-height:1.6;color:#333333;">Hi ${userName},</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#666666;">We received a request to reset your password. Click the button below to create a new password.</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:20px 40px 40px 40px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#000000;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;letter-spacing:0.5px;" target="_blank">RESET PASSWORD</a>
                  </td>
                </tr>
              </table>
              <p style="margin:30px 0 0 0;font-size:13px;color:#999999;line-height:1.6;">
                Or copy this link:<br>
                <a href="${resetUrl}" style="color:#666666;word-break:break-all;">${resetUrl}</a>
              </p>
              <p style="margin:15px 0 0 0;font-size:13px;color:#999999;">This link expires in 1 hour.</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:30px 40px;background-color:#f9f9f9;border-top:1px solid #dddddd;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#666666;text-align:center;">If you didn't request this, you can ignore this email.</p>
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getVerificationOTPEmailHTML(
  verificationCode: string,
  userName: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your Email</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dddddd;">
          
          <tr>
            <td style="padding:30px 40px;border-bottom:2px solid #000000;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#000000;letter-spacing:-0.5px;">${APP_NAME}</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding:40px 40px 30px 40px;text-align:center;">
              <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#000000;">Verify Your Email</h2>
              <p style="margin:0 0 15px 0;font-size:15px;line-height:1.6;color:#333333;">Hi ${userName},</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#666666;">Use this verification code to complete your registration:</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:0 40px 40px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:25px;background-color:#f9f9f9;border:2px dashed #cccccc;text-align:center;">
                    <p style="margin:0;font-size:32px;font-weight:bold;color:#000000;letter-spacing:8px;font-family:'Courier New',Courier,monospace;">${verificationCode}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0 0;font-size:13px;color:#999999;text-align:center;">This code expires in 10 minutes</p>
              <p style="margin:10px 0 0 0;font-size:13px;color:#999999;text-align:center;">If you didn't request this, ignore this email.</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:30px 40px;background-color:#f9f9f9;border-top:1px solid #dddddd;">
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getWelcomeEmailHTML(userName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to ${APP_NAME}</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dddddd;">
          
          <tr>
            <td style="padding:30px 40px;border-bottom:2px solid #000000;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#000000;letter-spacing:-0.5px;">${APP_NAME}</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding:40px 40px 20px 40px;">
              <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#000000;">Welcome to ${APP_NAME}</h2>
              <p style="margin:0 0 15px 0;font-size:15px;line-height:1.6;color:#333333;">Hi ${userName},</p>
              <p style="margin:0 0 15px 0;font-size:15px;line-height:1.6;color:#666666;">Thank you for verifying your email. Your account is now fully activated.</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#666666;">Start exploring our collection of premium furniture and find the perfect pieces for your home.</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:20px 40px 40px 40px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#000000;">
                    <a href="${CLIENT_URL}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;letter-spacing:0.5px;" target="_blank">START SHOPPING</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding:30px 40px;background-color:#f9f9f9;border-top:1px solid #dddddd;">
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getPasswordResetCodeEmailHTML(
  code: string,
  userName: string,
): string {
  const firstName = userName?.split(" ")[0] || "there";

  return `<div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
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
  </div>`;
}
