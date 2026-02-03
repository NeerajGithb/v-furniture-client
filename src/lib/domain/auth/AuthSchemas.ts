import { z } from "zod";

// Password validation schema with all strength requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character",
  );

// Login schema
export const LoginSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// Register schema with comprehensive password validation
export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: passwordSchema,
  photoURL: z.string().url().optional().or(z.literal("")),
});

// Verify email code schema
export const VerifyEmailCodeSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must be numeric"),
});

// Send reset code schema
export const SendResetCodeSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
});

// Verify reset code schema
export const VerifyResetCodeSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must be numeric"),
});

// Reset password schema with comprehensive password validation
export const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  newPassword: passwordSchema,
});

// Send verification code schema
export const SendVerificationCodeSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
});

// Resend OTP schema
export const ResendOTPSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
});

// Verify email schema (for existing users)
export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Type exports
export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type VerifyEmailCodeRequest = z.infer<typeof VerifyEmailCodeSchema>;
export type SendResetCodeRequest = z.infer<typeof SendResetCodeSchema>;
export type VerifyResetCodeRequest = z.infer<typeof VerifyResetCodeSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
export type SendVerificationCodeRequest = z.infer<
  typeof SendVerificationCodeSchema
>;
export type ResendOTPRequest = z.infer<typeof ResendOTPSchema>;
export type VerifyEmailRequest = z.infer<typeof VerifyEmailSchema>;
