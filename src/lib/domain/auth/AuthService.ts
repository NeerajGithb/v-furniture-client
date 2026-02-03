import { IAuthRepository } from "./IAuthRepository";
import { AuthRepository } from "./AuthRepository";
import {
  LoginRequest,
  RegisterRequest,
  VerifyEmailCodeRequest,
  SendResetCodeRequest,
  VerifyResetCodeRequest,
  ResetPasswordRequest,
  ResendOTPRequest,
} from "./AuthSchemas";
import {
  UserNotFoundError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  AccountLockedError,
  EmailNotVerifiedError,
  RateLimitExceededError,
  InvalidVerificationCodeError,
  PendingRegistrationNotFoundError,
  InvalidResetCodeError,
  WeakPasswordError,
  InvalidTokenError,
  MissingTokenError,
} from "./AuthErrors";
import { generateOTP } from "@/lib/auth/otpService";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getAccessTokenFromCookie,
} from "@/lib/security/auth";
import { invalidateCacheByPrefix } from "@/lib/cache";
import { withTransaction } from "@/lib/utils/transaction";
import { verifyPassword } from "@/lib/security/auth";
import crypto from "crypto";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  tokens: AuthTokens;
}

export interface RegisterResult {
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  tokens?: AuthTokens;
  requiresVerification?: boolean;
}

export interface CurrentUserResult {
  user: {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
    phone?: string;
    createdAt?: string;
  };
}

export class AuthService {
  constructor(private repository: IAuthRepository = new AuthRepository()) { }

  // User login with transaction support
  async login(
    data: LoginRequest,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginResult> {
    const { email, password } = data;

    return await withTransaction(async (session) => {
      // Apply rate limiting
      const rateLimitCheck = await this.repository.checkLoginRateLimit(
        ipAddress,
        email,
      );
      if (!rateLimitCheck.success) {
        throw new RateLimitExceededError(
          rateLimitCheck.message || "Too many login attempts",
        );
      }

      // Check if account is locked
      const lockStatus = await this.repository.checkAccountLock(email);
      if (lockStatus.locked) {
        const minutes = Math.ceil((lockStatus.remainingTime || 0) / 60);
        throw new AccountLockedError(minutes);
      }

      // Find user with password
      const user = await this.repository.findUserByEmailWithPassword(email);
      if (!user) {
        await this.repository.recordFailedLogin(email);
        throw new UserNotFoundError(email);
      }

      // Verify password using centralized security function
      const isMatch = await verifyPassword(password, user.password!);
      if (!isMatch) {
        const failedResult = await this.repository.recordFailedLogin(email);
        if (failedResult.locked) {
          throw new AccountLockedError(30);
        }

        throw new InvalidCredentialsError(failedResult.remainingAttempts);
      }

      // Check if email is verified (skip for OAuth users)
      if (!user.hasOAuth && !user.emailVerified) {
        throw new EmailNotVerifiedError();
      }

      // Successful login - reset failed attempts and update login info (atomic)
      await this.repository.resetFailedAttempts(email);
      await this.repository.updateUserLoginInfo(user._id, ipAddress);

      // Invalidate user cache
      await invalidateCacheByPrefix(`user:${user._id}`);

      // Create tokens
      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      return {
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    });
  }

  // User registration with transaction support
  async register(
    data: RegisterRequest,
    ipAddress: string,
    userAgent: string,
  ): Promise<RegisterResult> {
    const { name, email, password, photoURL } = data;

    return await withTransaction(async (session) => {
      // Apply rate limiting
      const rateLimitCheck =
        await this.repository.checkRegisterRateLimit(ipAddress);
      if (!rateLimitCheck.success) {
        throw new RateLimitExceededError(
          rateLimitCheck.message || "Too many registration attempts",
        );
      }

      // Check if user already exists
      const existingUser = await this.repository.findUserByEmail(email);
      if (existingUser) {
        throw new EmailAlreadyExistsError(email);
      }

      // Use secure OTP system for email verification
      const verificationCode = generateOTP();

      // Store pending registration (not creating user yet)
      await this.repository.storePendingRegistration(email, {
        name,
        email,
        password: password!,
        photoURL: photoURL || "",
        hasOAuth: false,
        verificationCode,
        ipAddress,
        userAgent,
      });

      // Send secure OTP email
      const otpSent = await this.repository.sendOTPEmail(
        email,
        verificationCode,
        name,
      );

      if (!otpSent) {
        throw new Error("Failed to send verification code. Please try again.");
      }

      return {
        message: "Verification code sent. Please check your email.",
        requiresVerification: true,
      };
    });
  }

  // Verify email code and complete registration with transaction support
  async verifyEmailCode(
    data: VerifyEmailCodeRequest,
    ipAddress: string,
  ): Promise<LoginResult> {
    const { email, code } = data;

    return await withTransaction(async (session) => {
      // Verify OTP using secure service
      const otpVerification = await this.repository.verifyOTP(email, code);

      if (!otpVerification.success) {
        throw new InvalidVerificationCodeError(
          otpVerification.attemptsRemaining,
        );
      }

      // Get pending registration
      const pending = await this.repository.getPendingRegistration(email);
      if (!pending) {
        throw new PendingRegistrationNotFoundError();
      }

      // Check if user was created in the meantime
      const existingUser = await this.repository.findUserByEmail(email);
      if (existingUser) {
        await this.repository.deletePendingRegistration(email);
        throw new EmailAlreadyExistsError(email);
      }

      // Create the user NOW (after OTP verification)
      const newUser = await this.repository.createUser({
        name: pending.name,
        email: pending.email,
        password: pending.password,
        photoURL: pending.photoURL,
        hasOAuth: false,
        emailVerified: true,
        lastLoginIP: ipAddress,
      });

      // Clean up
      await this.repository.deletePendingRegistration(email);
      await this.repository.clearOTPRecord(email);

      // Invalidate cache for new user
      await invalidateCacheByPrefix(`user:${newUser._id}`);

      // Log registration
      // Send welcome email (async, don't wait for it)
      this.repository
        .sendWelcomeEmail(newUser.email, newUser.name)
        .catch(console.error);

      // Create tokens
      const accessToken = createAccessToken(newUser);
      const refreshToken = createRefreshToken(newUser);

      return {
        message: "Email verified and account created successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    });
  }

  // Send password reset code
  async sendResetCode(
    data: SendResetCodeRequest,
  ): Promise<{ success: boolean }> {
    const { email } = data;

    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new UserNotFoundError(email);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    await this.repository.storeResetCode(email, hashedCode, expires);
    await this.repository.sendPasswordResetEmail(email, user.name, code);

    return { success: true };
  }

  // Verify reset code
  async verifyResetCode(
    data: VerifyResetCodeRequest,
  ): Promise<{ valid: boolean }> {
    const { email, code } = data;

    const isValid = await this.repository.verifyResetCode(email, code);
    if (!isValid) {
      throw new InvalidResetCodeError();
    }

    return { valid: true };
  }

  // Reset password with transaction support
  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<{ success: boolean }> {
    const { email, newPassword } = data;

    return await withTransaction(async (session) => {
      const user = await this.repository.findUserByEmail(email);
      if (!user) {
        throw new UserNotFoundError(email);
      }

      await this.repository.updateUserPassword(email, newPassword);
      await this.repository.clearResetCode(email);

      // Invalidate user cache after password change
      await invalidateCacheByPrefix(`user:${user._id}`);

      return { success: true };
    });
  }

  // Get current user from token
  async getCurrentUser(token: string): Promise<CurrentUserResult> {
    if (!token) {
      throw new MissingTokenError();
    }

    const payload = await verifyAccessToken(token);
    if (!payload?.userId) {
      throw new InvalidTokenError("Invalid access token");
    }

    const user = await this.repository.findUserById(payload.userId);
    if (!user) {
      throw new InvalidTokenError("User not found");
    }


    const result = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        phone: user.phone,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      },
    };


    return result;
  }

  // Refresh tokens
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new MissingTokenError("No refresh token");
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload?.userId) {
      throw new InvalidTokenError("Invalid refresh token");
    }

    const user = await this.repository.findUserById(payload.userId);
    if (!user) {
      throw new InvalidTokenError("User not found");
    }

    // Invalidate old token cache
    await invalidateCacheByPrefix(`user:${user._id}`);

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Resend OTP
  async resendOTP(data: ResendOTPRequest): Promise<{ success: boolean }> {
    const { email } = data;

    const pending = await this.repository.getPendingRegistration(email);
    if (!pending) {
      // If pending registration expired, check if user already exists
      const existingUser = await this.repository.findUserByEmail(email);
      if (existingUser) {
        throw new EmailAlreadyExistsError(email);
      }

      // Pending registration expired, user needs to start registration again
      throw new PendingRegistrationNotFoundError();
    }

    const newCode = generateOTP();

    // Update pending registration with new code and extend TTL
    await this.repository.storePendingRegistration(email, {
      ...pending,
      verificationCode: newCode,
    });

    // Also extend TTL to give user more time
    await this.repository.extendPendingRegistrationTTL?.(email);

    const otpSent = await this.repository.sendOTPEmail(
      email,
      newCode,
      pending.name,
    );

    if (!otpSent) {
      throw new Error("Failed to resend verification code. Please try again.");
    }

    return { success: true };
  }

  // Logout user - verify authentication and clear cache
  async logout(
    accessToken: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify the token to ensure user was actually logged in
    const payload = await verifyAccessToken(accessToken);

    if (!payload?.userId) {
      return {
        success: true,
        message: "Logged out successfully (invalid session)",
      };
    }

    // Valid token - user was authenticated, clear their cache
    await invalidateCacheByPrefix(`user:${payload.userId}`);

    return {
      success: true,
      message: "Logged out successfully",
    };
  }
}

export const authService = new AuthService();
