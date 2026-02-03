import { User } from "@/types/user";
import { RegisterRequest } from "./AuthSchemas";

export interface PendingRegistration {
  name: string;
  email: string;
  password: string;
  photoURL?: string;
  hasOAuth: boolean;
  verificationCode: string;
  ipAddress: string;
  userAgent: string;
}

export interface LoginAttemptInfo {
  success: boolean;
  remainingAttempts?: number;
  locked?: boolean;
  remainingTime?: number;
}

export interface OTPVerificationResult {
  success: boolean;
  error?: string;
  attemptsRemaining?: number;
}

export interface IAuthRepository {
  // User operations
  findUserByEmail(email: string): Promise<User | null>;
  findUserByEmailWithPassword(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(
    data: RegisterRequest & {
      hasOAuth?: boolean;
      emailVerified?: boolean;
      lastLoginIP?: string;
    },
  ): Promise<User>;
  updateUserLoginInfo(userId: string, ipAddress: string): Promise<void>;
  updateUserPassword(email: string, newPassword: string): Promise<void>;

  // Security operations
  checkAccountLock(
    email: string,
  ): Promise<{ locked: boolean; remainingTime?: number }>;
  recordFailedLogin(email: string): Promise<LoginAttemptInfo>;
  resetFailedAttempts(email: string): Promise<void>;

  // Rate limiting
  checkLoginRateLimit(
    ipAddress: string,
    email: string,
  ): Promise<{ success: boolean; message?: string }>;
  checkRegisterRateLimit(
    ipAddress: string,
  ): Promise<{ success: boolean; message?: string }>;

  // Pending registrations
  storePendingRegistration(
    email: string,
    data: PendingRegistration,
  ): Promise<void>;
  getPendingRegistration(email: string): Promise<PendingRegistration | null>;
  deletePendingRegistration(email: string): Promise<void>;
  extendPendingRegistrationTTL?(email: string): Promise<boolean>;

  // OTP operations
  sendOTPEmail(email: string, code: string, name: string): Promise<boolean>;
  verifyOTP(email: string, code: string): Promise<OTPVerificationResult>;
  clearOTPRecord(email: string): Promise<void>;

  // Password reset
  storeResetCode(
    email: string,
    hashedCode: string,
    expires: Date,
  ): Promise<void>;
  verifyResetCode(email: string, code: string): Promise<boolean>;
  clearResetCode(email: string): Promise<void>;

  // Email operations
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendPasswordResetEmail(
    email: string,
    name: string,
    code: string,
  ): Promise<void>;
}
