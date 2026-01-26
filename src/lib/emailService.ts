// Email service using Nodemailer with Gmail
import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_NAME = 'VFurniture';
const SENDER_NAME = 'VFurniture Support'; // Change this to whatever you want

// Brand colors
const BRAND = {
  primary: '#8E5D52',
  strong: '#7A4A40',
  dark: '#6B443C',
  text: '#FDF4F2',
  muted: '#E5D1CC',
};

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn('⚠️ Email credentials not configured. Email sending will be disabled.');
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify connection on startup
if (EMAIL_USER && EMAIL_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email service error:', error);
    } else {
      console.log('✅ Email service ready');
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
    console.log('📧 Email would be sent to:', options.to);
    console.log('Subject:', options.subject);
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
    
    console.log('✅ Email sent to:', options.to);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

// Email templates
export function getVerificationEmailHTML(verificationUrl: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: ${BRAND.primary}; padding: 30px; text-align: center;">
                  <h1 style="color: ${BRAND.text}; margin: 0; font-size: 28px;">${APP_NAME}</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hi ${userName},
                  </p>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Thank you for registering with ${APP_NAME}! To complete your registration and start shopping, please verify your email address by clicking the button below.
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${verificationUrl}" style="background-color: ${BRAND.primary}; color: ${BRAND.text}; padding: 14px 40px; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 600; display: inline-block;">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                    Or copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}" style="color: ${BRAND.strong}; word-break: break-all;">${verificationUrl}</a>
                  </p>
                  
                  <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    This link will expire in 24 hours.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0;">
                    If you didn't create an account with ${APP_NAME}, you can safely ignore this email.
                  </p>
                  <p style="color: #999999; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getPasswordResetEmailHTML(resetUrl: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: ${BRAND.primary}; padding: 30px; text-align: center;">
                  <h1 style="color: ${BRAND.text}; margin: 0; font-size: 28px;">${APP_NAME}</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hi ${userName},
                  </p>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    We received a request to reset your password. Click the button below to create a new password.
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${resetUrl}" style="background-color: ${BRAND.primary}; color: ${BRAND.text}; padding: 14px 40px; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 600; display: inline-block;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                    Or copy and paste this link into your browser:<br>
                    <a href="${resetUrl}" style="color: ${BRAND.strong}; word-break: break-all;">${resetUrl}</a>
                  </p>
                  
                  <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    This link will expire in 1 hour.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                  </p>
                  <p style="color: #999999; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Email Verification OTP Template
export function getVerificationOTPEmailHTML(verificationCode: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: ${BRAND.primary}; padding: 30px; text-align: center;">
                    <h1 style="color: ${BRAND.text}; margin: 0; font-size: 28px; font-weight: 600;">${APP_NAME}</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hi ${userName},
                    </p>
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Thank you for registering! Please use the verification code below to complete your registration:
                    </p>
                    
                    <!-- OTP Code Box -->
                    <div style="background-color: ${BRAND.muted}; padding: 25px; border-radius: 8px; margin: 0 0 30px 0; border: 2px dashed ${BRAND.dark};">
                      <p style="font-size: 36px; font-weight: bold; color: ${BRAND.dark}; margin: 0; letter-spacing: 10px; font-family: 'Courier New', monospace;">
                        ${verificationCode}
                      </p>
                    </div>
                    
                    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                      This code expires in <strong>10 minutes</strong>
                    </p>
                    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 0;">
                      If you didn't request this, please ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function getWelcomeEmailHTML(userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${APP_NAME}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: ${BRAND.primary}; padding: 30px; text-align: center;">
                  <h1 style="color: ${BRAND.text}; margin: 0; font-size: 28px;">${APP_NAME}</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Welcome to ${APP_NAME}! 🎉</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hi ${userName},
                  </p>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Thank you for verifying your email! Your account is now fully activated and ready to use.
                  </p>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Start exploring our collection of premium furniture and find the perfect pieces for your home.
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}" style="background-color: ${BRAND.primary}; color: ${BRAND.text}; padding: 14px 40px; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 600; display: inline-block;">
                          Start Shopping
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Helper functions for order confirmation email
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

const getUserFriendlyPaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    cod: 'Cash on Delivery',
    COD: 'Cash on Delivery',
    cash_on_delivery: 'Cash on Delivery',
    online: 'Online Payment',
    card: 'Credit/Debit Card',
    upi: 'UPI Payment',
    netbanking: 'Net Banking',
    wallet: 'Digital Wallet',
    razorpay: 'Razorpay Payment',
    stripe: 'Stripe Payment',
    paypal: 'PayPal',
    paytm: 'Paytm Wallet',
    gpay: 'Google Pay',
    phonepe: 'PhonePe',
  };
  return methods[method?.toLowerCase()] || 'Cash on Delivery';
};

export function getOrderConfirmationEmailHTML(order: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Received #${order.orderNumber} - ${APP_NAME}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #2c3e50; background-color: #f8f9fa; }
    .email-wrapper { width: 100%; background-color: #f8f9fa; padding: 20px 0; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #ecf0f1; border-radius: 8px; overflow: hidden; }
    .header { background: ${BRAND.primary}; color: ${BRAND.text}; text-align: center; padding: 24px; height: 100px; display: flex; flex-direction: column; justify-content: center; }
    .brand-logo { font-size: 20px; font-weight: 700; margin-bottom: 4px; letter-spacing: 1px; }
    .status-message { font-size: 14px; opacity: 0.95; }
    .content-section { padding: 24px; border-bottom: 1px solid #ecf0f1; }
    .content-section:last-child { border-bottom: none; }
    .section-title { font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #ecf0f1; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 16px 0; }
    .info-card { padding: 16px; border: 1px solid #ecf0f1; border-radius: 6px; background: #f8f9fa; }
    .info-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #7f8c8d; margin-bottom: 4px; letter-spacing: 0.5px; }
    .info-value { font-size: 15px; font-weight: 600; color: #2c3e50; }
    .product-item { display: flex; align-items: flex-start; padding: 16px 0; border-bottom: 1px solid #ecf0f1; }
    .product-item:last-child { border-bottom: none; }
    .product-image { width: 60px; height: 60px; background: #f8f9fa; border: 1px solid #ecf0f1; border-radius: 6px; margin-right: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
    .product-details { flex: 1; min-width: 0; }
    .product-name { font-weight: 600; color: #2c3e50; margin-bottom: 4px; font-size: 15px; }
    .product-quantity { font-size: 12px; color: #7f8c8d; background: #f8f9fa; border: 1px solid #ecf0f1; padding: 2px 8px; border-radius: 4px; display: inline-block; }
    .product-price { font-weight: 700; color: ${BRAND.strong}; font-size: 16px; text-align: right; min-width: 80px; }
    .total-section { background: ${BRAND.muted}; border: 2px solid ${BRAND.primary}; padding: 20px; border-radius: 6px; margin: 16px 0; }
    .total-row { display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 700; color: ${BRAND.dark}; margin-bottom: 8px; }
    .total-row:last-child { margin-bottom: 0; }
    .payment-status { font-size: 14px; font-weight: 600; color: #16a085; text-transform: uppercase; letter-spacing: 0.5px; }
    .address-card { background: #f8f9fa; border: 1px solid #ecf0f1; padding: 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; }
    .cta-button { display: inline-block; background: ${BRAND.primary}; color: ${BRAND.text}; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 16px 0; border: none; cursor: pointer; }
    .footer { background: ${BRAND.dark}; color: ${BRAND.text}; padding: 24px; text-align: center; }
    .footer-brand { font-size: 20px; font-weight: 700; margin-bottom: 8px; letter-spacing: 1px; }
    .footer-text { color: ${BRAND.muted}; font-size: 14px; line-height: 1.5; margin: 8px 0; }
    .contact-info { margin: 16px 0; font-size: 13px; color: ${BRAND.muted}; }
    .contact-info a { color: ${BRAND.muted}; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .email-wrapper { padding: 0; }
      .email-container { border-radius: 0; border-left: none; border-right: none; }
      .header { padding: 20px 16px; }
      .content-section { padding: 16px; }
      .info-grid { grid-template-columns: 1fr; gap: 12px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="header">
        <div class="brand-logo">${APP_NAME.toUpperCase()}</div>
        <div class="status-message">Order Received Successfully</div>
      </div>
      
      <div class="content-section">
        <div class="section-title">Order Summary</div>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-label">Order Number</div>
            <div class="info-value">#${order.orderNumber}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Order Date</div>
            <div class="info-value">${formatDate(order.createdAt)}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Payment Method</div>
            <div class="info-value">${getUserFriendlyPaymentMethod(order.paymentMethod)}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Order Status</div>
            <div class="info-value">Order Received</div>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">Your Products</div>
        ${order.items
          .map(
            (item: any) => `
          <div class="product-item">
            <div class="product-image">🪑</div>
            <div class="product-details">
              <div class="product-name">${item.name}</div>
              <div class="product-quantity">Qty: ${item.quantity}</div>
            </div>
            <div class="product-price">${formatCurrency(item.price * item.quantity)}</div>
          </div>
        `,
          )
          .join('')}
        
        <div class="total-section">
          <div class="total-row">
            <span>Total Amount</span>
            <span>${formatCurrency(order.totalAmount)}</span>
          </div>
          ${
            order.paymentStatus === 'paid'
              ? '<div class="total-row"><span></span><span class="payment-status">PAID</span></div>'
              : ''
          }
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">Shipping Address</div>
        <div class="address-card">
          <strong>${order.shippingAddress.fullName}</strong><br>
          ${order.shippingAddress.addressLine1}<br>
          ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
          ${order.shippingAddress.country}<br><br>
          <strong>Phone:</strong> ${order.shippingAddress.phone}
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">What's Next?</div>
        <p style="color: #7f8c8d; margin-bottom: 16px;">Your order will be confirmed within 24 hours. Our craftsmen will then begin creating your premium furniture with attention to detail.</p>
        <a href="${APP_URL}/orders/${order._id}" class="cta-button">View Order Details</a>
      </div>
      
      <div class="footer">
        <div class="footer-brand">${APP_NAME.toUpperCase()}</div>
        <div class="footer-text">Premium Quality • Timeless Design • Exceptional Service</div>
        <div class="contact-info">
          <a href="mailto:${EMAIL_USER}">${EMAIL_USER}</a><br>
          ${APP_URL}
        </div>
        <div class="footer-text" style="margin-top: 16px; font-size: 12px; opacity: 0.8;">
          This is an automated message. Please do not reply to this email.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}