import {
  IAuthRepository,
  PendingRegistration,
  LoginAttemptInfo,
  OTPVerificationResult,
} from "./IAuthRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import { RegisterRequest } from "./AuthSchemas";
import { User } from "@/types/user";
import UserModel from "@/models/User";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import { formatUserData, formatName, formatEmail } from "@/utils/formatters";
import { hashPassword } from "@/lib/security/auth";
import crypto from "crypto";
import { withTransaction } from "@/lib/utils/transaction";
import { redis } from "@/lib/cache";

// Import existing services
import {
  storePendingRegistration,
  getPendingRegistration,
  deletePendingRegistration,
  extendPendingRegistrationTTL,
} from "@/lib/pendingRegistrations";
import { sendOTPEmail, verifyOTP, clearOTPRecord } from "@/lib/auth/otpService";
import {
  sendEmail,
  getWelcomeEmailHTML,
  getPasswordResetCodeEmailHTML,
} from "@/lib/emailService";

export class AuthRepository implements IAuthRepository {
  // Find user by email (without password)
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email }).lean();
      return user ? this.mapToUserType(user) : null;
    } catch (error) {
      throw new RepositoryError("Failed to find user by email", error as Error);
    }
  }

  // Find user by email with password
  async findUserByEmailWithPassword(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email })
        .select("+password")
        .lean();
      return user ? this.mapToUserType(user) : null;
    } catch (error) {
      throw new RepositoryError(
        "Failed to find user by email with password",
        error as Error,
      );
    }
  }

  // Find user by ID
  async findUserById(id: string): Promise<User | null> {
    try {
      const user = await UserModel.findById(id)
        .select("name email _id photoURL phone createdAt")
        .lean();
      return user ? this.mapToUserType(user) : null;
    } catch (error) {
      throw new RepositoryError("Failed to find user by ID", error as Error);
    }
  }

  // Create new user with transaction support
  async createUser(
    data: RegisterRequest & {
      hasOAuth?: boolean;
      emailVerified?: boolean;
      lastLoginIP?: string;
    },
  ): Promise<User> {
    try {
      // Handle OAuth users differently since they don't have passwords
      let userData: any;

      if (data.hasOAuth) {
        const formattedName = formatName(data.name);

        userData = {
          name: formattedName,
          email: formatEmail(data.email),
          password: crypto.randomBytes(16).toString("hex"),
          photoURL: data.photoURL || "",
          hasOAuth: true,
          emailVerified: data.emailVerified || false,
          lastLoginAt: new Date(),
          lastLoginIP: data.lastLoginIP || "unknown",
        };
      } else {
        const formattedData = formatUserData({
          name: data.name,
          email: data.email,
          password: data.password!,
        });

        // Hash password using centralized security function
        const hashedPassword = await hashPassword(formattedData.password);

        userData = {
          ...formattedData,
          password: hashedPassword,
          photoURL: data.photoURL || "",
          hasOAuth: false,
          emailVerified: data.emailVerified || false,
          lastLoginAt: new Date(),
          lastLoginIP: data.lastLoginIP || "unknown",
        };
      }

      const user = await UserModel.create(userData);
      return this.mapToUserType(user.toObject());
    } catch (error) {
      throw new RepositoryError("Failed to create user", error as Error);
    }
  }

  // Update user login info
  async updateUserLoginInfo(userId: string, ipAddress: string): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        lastLoginAt: new Date(),
        lastLoginIP: ipAddress,
        failedLoginAttempts: 0,
        accountLockedUntil: undefined,
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to update user login info",
        error as Error,
      );
    }
  }

  // Update user password
  async updateUserPassword(email: string, newPassword: string): Promise<void> {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      // Hash password using centralized security function
      user.password = await hashPassword(newPassword);
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      await user.save();
    } catch (error) {
      throw new RepositoryError(
        "Failed to update user password",
        error as Error,
      );
    }
  }

  // Check account lock status with database persistence
  async checkAccountLock(
    email: string,
  ): Promise<{ locked: boolean; remainingTime?: number }> {
    try {
      return await withTransaction(async (session) => {
        const user = await UserModel.findOne({ email })
          .select("failedLoginAttempts accountLockedUntil")
          .session(session);

        if (!user) {
          return { locked: false };
        }

        // Check if account is currently locked
        if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
          const remainingTime = Math.ceil(
            (user.accountLockedUntil.getTime() - Date.now()) / 1000,
          );
          return { locked: true, remainingTime };
        }

        // If lock has expired, reset the lock
        if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
          await UserModel.findOneAndUpdate(
            { email },
            {
              $unset: { accountLockedUntil: 1 },
              $set: { failedLoginAttempts: 0 },
            },
            { session },
          );
        }

        return { locked: false };
      });
    } catch (error) {
      throw new RepositoryError("Failed to check account lock", error as Error);
    }
  }

  // Record failed login attempt with database persistence
  async recordFailedLogin(email: string): Promise<LoginAttemptInfo> {
    try {
      return await withTransaction(async (session) => {
        const MAX_FAILED_ATTEMPTS = 5;
        const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

        const user = await UserModel.findOne({ email }).session(session);

        if (!user) {
          // Don't reveal if user exists or not for security
          return {
            success: false,
            remainingAttempts: MAX_FAILED_ATTEMPTS - 1,
            locked: false,
          };
        }

        const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
        const updateData: any = { failedLoginAttempts: newFailedAttempts };

        // Lock account if max attempts reached
        if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
          updateData.accountLockedUntil = new Date(
            Date.now() + LOCKOUT_DURATION,
          );
        }

        await UserModel.findByIdAndUpdate(user._id, updateData, { session });

        return {
          success: false,
          remainingAttempts: Math.max(
            0,
            MAX_FAILED_ATTEMPTS - newFailedAttempts,
          ),
          locked: newFailedAttempts >= MAX_FAILED_ATTEMPTS,
        };
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to record failed login",
        error as Error,
      );
    }
  }

  // Reset failed login attempts with database persistence
  async resetFailedAttempts(email: string): Promise<void> {
    try {
      await withTransaction(async (session) => {
        await UserModel.findOneAndUpdate(
          { email },
          {
            $set: { failedLoginAttempts: 0 },
            $unset: { accountLockedUntil: 1 },
          },
          { session },
        );
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to reset failed attempts",
        error as Error,
      );
    }
  }

  // Check login rate limit with Redis-based implementation
  async checkLoginRateLimit(
    ipAddress: string,
    email: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      return await withTransaction(async (session) => {
        // Use Redis for distributed rate limiting
        const ipKey = `ratelimit:login:ip:${ipAddress}`;
        const emailKey = `ratelimit:login:email:${email}`;

        // Check IP-based rate limit (10 attempts per 15 minutes)
        const ipCount = await redis.incr(ipKey);
        if (ipCount === 1) {
          await redis.expire(ipKey, 15 * 60); // 15 minutes
        }

        if (ipCount > 10) {
          return {
            success: false,
            message:
              "Too many login attempts from this IP. Please try again later.",
          };
        }

        // Check email-based rate limit (5 attempts per 15 minutes)
        const emailCount = await redis.incr(emailKey);
        if (emailCount === 1) {
          await redis.expire(emailKey, 15 * 60); // 15 minutes
        }

        if (emailCount > 5) {
          return {
            success: false,
            message:
              "Too many login attempts for this email. Please try again later.",
          };
        }

        return { success: true };
      });
    } catch (error) {
      // Fallback to allowing request if Redis fails
      return { success: true };
    }
  }

  // Check register rate limit with Redis-based implementation
  async checkRegisterRateLimit(
    ipAddress: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      return await withTransaction(async (session) => {
        // Use Redis for distributed rate limiting
        const ipKey = `ratelimit:register:ip:${ipAddress}`;

        // Check IP-based rate limit (5 registrations per hour)
        const ipCount = await redis.incr(ipKey);
        if (ipCount === 1) {
          await redis.expire(ipKey, 60 * 60); // 1 hour
        }

        if (ipCount > 5) {
          return {
            success: false,
            message: "Too many registration attempts. Please try again later.",
          };
        }

        return { success: true };
      });
    } catch (error) {
      // Fallback to allowing request if Redis fails
      return { success: true };
    }
  }

  // Store pending registration
  async storePendingRegistration(
    email: string,
    data: PendingRegistration,
  ): Promise<void> {
    try {
      storePendingRegistration(email, data);
    } catch (error) {
      throw new RepositoryError(
        "Failed to store pending registration",
        error as Error,
      );
    }
  }

  // Get pending registration
  async getPendingRegistration(
    email: string,
  ): Promise<PendingRegistration | null> {
    try {
      const result = await getPendingRegistration(email);
      return result || null;
    } catch (error) {
      throw new RepositoryError(
        "Failed to get pending registration",
        error as Error,
      );
    }
  }

  // Delete pending registration
  async deletePendingRegistration(email: string): Promise<void> {
    try {
      await deletePendingRegistration(email);
    } catch (error) {
      throw new RepositoryError(
        "Failed to delete pending registration",
        error as Error,
      );
    }
  }

  // Extend pending registration TTL
  async extendPendingRegistrationTTL(email: string): Promise<boolean> {
    try {
      return await extendPendingRegistrationTTL(email);
    } catch (error) {
      throw new RepositoryError(
        "Failed to extend pending registration TTL",
        error as Error,
      );
    }
  }

  // Send OTP email
  async sendOTPEmail(
    email: string,
    code: string,
    name: string,
  ): Promise<boolean> {
    try {
      return await sendOTPEmail(email, code, name);
    } catch (error) {
      throw new RepositoryError("Failed to send OTP email", error as Error);
    }
  }

  // Verify OTP
  async verifyOTP(email: string, code: string): Promise<OTPVerificationResult> {
    try {
      return await verifyOTP(email, code);
    } catch (error) {
      throw new RepositoryError("Failed to verify OTP", error as Error);
    }
  }

  // Clear OTP record
  async clearOTPRecord(email: string): Promise<void> {
    try {
      await clearOTPRecord(email);
    } catch (error) {
      throw new RepositoryError("Failed to clear OTP record", error as Error);
    }
  }

  // Store reset code
  async storeResetCode(
    email: string,
    hashedCode: string,
    expires: Date,
  ): Promise<void> {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      user.resetCode = hashedCode;
      user.resetCodeExpires = expires;
      user.markModified("resetCode");
      user.markModified("resetCodeExpires");
      await user.save();
    } catch (error) {
      throw new RepositoryError("Failed to store reset code", error as Error);
    }
  }

  // Verify reset code
  async verifyResetCode(email: string, code: string): Promise<boolean> {
    try {
      const user = await UserModel.findOne({ email });
      if (!user || !user.resetCode || !user.resetCodeExpires) {
        return false;
      }

      if (new Date() > user.resetCodeExpires) {
        return false;
      }

      const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
      return hashedCode === user.resetCode;
    } catch (error) {
      throw new RepositoryError("Failed to verify reset code", error as Error);
    }
  }

  // Clear reset code
  async clearResetCode(email: string): Promise<void> {
    try {
      await UserModel.findOneAndUpdate(
        { email },
        {
          $unset: {
            resetCode: 1,
            resetCodeExpires: 1,
          },
        },
      );
    } catch (error) {
      throw new RepositoryError("Failed to clear reset code", error as Error);
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await sendEmail({
        to: email,
        subject: `Welcome to VFurniture! 🎉`,
        html: getWelcomeEmailHTML(name),
        text: `Welcome to VFurniture, ${name}! Your account is now fully activated. Start exploring our collection of premium furniture.`,
      });
    } catch (error) {
      // Don't throw error for email failures - log and continue
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(
    email: string,
    name: string,
    code: string,
  ): Promise<void> {
    try {
      await sendEmail({
        to: email,
        subject: "Reset your VFurniture password",
        html: getPasswordResetCodeEmailHTML(code, name),
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to send password reset email",
        error as Error,
      );
    }
  }

  // Map database object to domain type
  private mapToUserType(db: any): User {
    validateRequiredFields(db, ["_id", "name", "email"], "user");

    return {
      _id: db._id.toString(),
      name: db.name,
      email: db.email,
      password: db.password,
      photoURL: db.photoURL || "",
      phone: db.phone,
      hasOAuth: db.hasOAuth || false,
      emailVerified: db.emailVerified || false,
      lastLoginAt: db.lastLoginAt,
      lastLoginIP: db.lastLoginIP,
      failedLoginAttempts: db.failedLoginAttempts || 0,
      accountLockedUntil: db.accountLockedUntil,
      resetCode: db.resetCode,
      resetCodeExpires: db.resetCodeExpires,
      createdAt: db.createdAt,
      updatedAt: db.updatedAt,
    };
  }
}
