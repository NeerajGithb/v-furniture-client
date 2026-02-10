import {
  IAuthRepository,
  PendingRegistration,
  LoginAttemptInfo,
  OTPVerificationResult,
} from "./IAuthRepository";
import { RegisterRequest } from "./AuthSchemas";
import { User } from "@/types/user";
import UserModel from "@/models/User";
import { validateRequiredFields } from "../shared/mapperUtils";
import { formatUserData, formatName, formatEmail } from "@/utils/formatters";
import { hashPassword } from "@/lib/security/auth";
import crypto from "crypto";
import { withTransaction } from "@/lib/utils/transaction";
import { redis } from "@/lib/cache";
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

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000;

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).lean();
    return user ? this.mapToUserType(user) : null;
  }

  async findUserByEmailWithPassword(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).select("+password").lean();
    return user ? this.mapToUserType(user) : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id)
      .select("name email _id photoURL phone createdAt")
      .lean();
    return user ? this.mapToUserType(user) : null;
  }

  async createUser(
    data: RegisterRequest & {
      hasOAuth?: boolean;
      emailVerified?: boolean;
      lastLoginIP?: string;
    },
  ): Promise<User> {
    let userData: any;

    if (data.hasOAuth) {
      userData = {
        name: formatName(data.name),
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

      userData = {
        ...formattedData,
        password: await hashPassword(formattedData.password),
        photoURL: data.photoURL || "",
        hasOAuth: false,
        emailVerified: data.emailVerified || false,
        lastLoginAt: new Date(),
        lastLoginIP: data.lastLoginIP || "unknown",
      };
    }

    const user = await UserModel.create(userData);
    return this.mapToUserType(user.toObject());
  }

  async updateUserLoginInfo(userId: string, ipAddress: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
      lastLoginIP: ipAddress,
      failedLoginAttempts: 0,
      accountLockedUntil: undefined,
    });
  }

  async updateUserPassword(email: string, newPassword: string): Promise<void> {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("User not found");

    user.password = await hashPassword(newPassword);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();
  }

  async checkAccountLock(
    email: string,
  ): Promise<{ locked: boolean; remainingTime?: number }> {
    return withTransaction(async (session) => {
      const user = await UserModel.findOne({ email })
        .select("failedLoginAttempts accountLockedUntil")
        .session(session);

      if (!user) return { locked: false };

      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        const remainingTime = Math.ceil(
          (user.accountLockedUntil.getTime() - Date.now()) / 1000,
        );
        return { locked: true, remainingTime };
      }

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
  }

  async recordFailedLogin(email: string): Promise<LoginAttemptInfo> {
    return withTransaction(async (session) => {
      const user = await UserModel.findOne({ email }).session(session);

      if (!user) {
        return {
          success: false,
          remainingAttempts: MAX_FAILED_ATTEMPTS - 1,
          locked: false,
        };
      }

      const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: any = { failedLoginAttempts: newFailedAttempts };

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.accountLockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
      }

      await UserModel.findByIdAndUpdate(user._id, updateData, { session });

      return {
        success: false,
        remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - newFailedAttempts),
        locked: newFailedAttempts >= MAX_FAILED_ATTEMPTS,
      };
    });
  }

  async resetFailedAttempts(email: string): Promise<void> {
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
  }

  async checkLoginRateLimit(
    ipAddress: string,
    email: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const ipKey = `ratelimit:login:ip:${ipAddress}`;
      const emailKey = `ratelimit:login:email:${email}`;

      const ipCount = await redis.incr(ipKey);
      if (ipCount === 1) await redis.expire(ipKey, 15 * 60);

      if (ipCount > 10) {
        return {
          success: false,
          message: "Too many login attempts from this IP. Please try again later.",
        };
      }

      const emailCount = await redis.incr(emailKey);
      if (emailCount === 1) await redis.expire(emailKey, 15 * 60);

      if (emailCount > 5) {
        return {
          success: false,
          message: "Too many login attempts for this email. Please try again later.",
        };
      }

      return { success: true };
    } catch (error) {
      return { success: true };
    }
  }

  async checkRegisterRateLimit(
    ipAddress: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const ipKey = `ratelimit:register:ip:${ipAddress}`;

      const ipCount = await redis.incr(ipKey);
      if (ipCount === 1) await redis.expire(ipKey, 60 * 60);

      if (ipCount > 5) {
        return {
          success: false,
          message: "Too many registration attempts. Please try again later.",
        };
      }

      return { success: true };
    } catch (error) {
      return { success: true };
    }
  }

  async storePendingRegistration(
    email: string,
    data: PendingRegistration,
  ): Promise<void> {
    storePendingRegistration(email, data);
  }

  async getPendingRegistration(email: string): Promise<PendingRegistration | null> {
    const result = await getPendingRegistration(email);
    return result || null;
  }

  async deletePendingRegistration(email: string): Promise<void> {
    await deletePendingRegistration(email);
  }

  async extendPendingRegistrationTTL(email: string): Promise<boolean> {
    return extendPendingRegistrationTTL(email);
  }

  async sendOTPEmail(email: string, code: string, name: string): Promise<boolean> {
    return sendOTPEmail(email, code, name);
  }

  async verifyOTP(email: string, code: string): Promise<OTPVerificationResult> {
    return verifyOTP(email, code);
  }

  async clearOTPRecord(email: string): Promise<void> {
    await clearOTPRecord(email);
  }

  async storeResetCode(
    email: string,
    hashedCode: string,
    expires: Date,
  ): Promise<void> {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("User not found");

    user.resetCode = hashedCode;
    user.resetCodeExpires = expires;
    user.markModified("resetCode");
    user.markModified("resetCodeExpires");
    await user.save();
  }

  async verifyResetCode(email: string, code: string): Promise<boolean> {
    const user = await UserModel.findOne({ email });
    if (!user || !user.resetCode || !user.resetCodeExpires) return false;
    if (new Date() > user.resetCodeExpires) return false;

    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    return hashedCode === user.resetCode;
  }

  async clearResetCode(email: string): Promise<void> {
    await UserModel.findOneAndUpdate(
      { email },
      { $unset: { resetCode: 1, resetCodeExpires: 1 } },
    );
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await sendEmail({
        to: email,
        subject: `Welcome to VFurniture! 🎉`,
        html: getWelcomeEmailHTML(name),
        text: `Welcome to VFurniture, ${name}! Your account is now fully activated. Start exploring our collection of premium furniture.`,
      });
    } catch (error) {
      // Silent fail - don't block registration for email issues
    }
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    code: string,
  ): Promise<void> {
    await sendEmail({
      to: email,
      subject: "Reset your VFurniture password",
      html: getPasswordResetCodeEmailHTML(code, name),
    });
  }

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