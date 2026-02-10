import {
  IOAuthRepository,
  User,
  OAuthTokens,
  OAuthUserInfo,
  AuthTokens,
} from "./IOAuthRepository";
import { OAuthProviderRequest } from "./OAuthSchemas";
import { validateRequiredFields } from "../shared/mapperUtils";
import { withTransaction } from "@/lib/utils/transaction";
import UserModel from "@/models/User";
import {
  getGoogleAuthUrl,
  getGoogleTokens,
  getGoogleUser,
} from "@/lib/google-auth";
import { createAccessToken, createRefreshToken } from "@/lib/security/auth";
import { formatName } from "@/utils/formatters";
import crypto from "crypto";

export class OAuthRepository implements IOAuthRepository {
  // Get OAuth authorization URL
  getAuthUrl(provider: OAuthProviderRequest): string {
    switch (provider) {
      case "google":
        return getGoogleAuthUrl();
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(
    provider: OAuthProviderRequest,
    code: string,
  ): Promise<OAuthTokens> {
    switch (provider) {
      case "google":
        const tokens = await getGoogleTokens(code);
        if (!tokens?.access_token) {
          throw new Error("No access token received from Google");
        }
        return tokens;
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  // Get user information from OAuth provider
  async getUserInfo(
    provider: OAuthProviderRequest,
    accessToken: string,
  ): Promise<OAuthUserInfo> {
    switch (provider) {
      case "google":
        const googleUser = await getGoogleUser(accessToken);
        if (!googleUser) {
          throw new Error("No user information received from Google");
        }
        return {
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          id: googleUser.id,
        };
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).lean();
    return user ? this.mapToUser(user) : null;
  }

  // Create new user with transaction support
  async createUser(userData: {
    name: string;
    email: string;
    photoURL?: string;
    hasOAuth: boolean;
  }): Promise<User> {
    return await withTransaction(async (session) => {
      const formattedName = formatName(userData.name);
      const user = new UserModel({
        ...userData,
        name: formattedName,
        password: userData.hasOAuth
          ? crypto.randomBytes(16).toString("hex")
          : undefined,
        emailVerified: userData.hasOAuth, // OAuth users are pre-verified
      });

      await user.save({ session });
      return this.mapToUser(user.toObject());
    });
  }

  // Update user with transaction support
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    return await withTransaction(async (session) => {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { ...updates, updatedAt: new Date() },
        { new: true, session },
      ).lean();

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      return this.mapToUser(user);
    });
  }

  // Create authentication tokens
  createAuthTokens(user: User): AuthTokens {
    return {
      accessToken: createAccessToken(user),
      refreshToken: createRefreshToken(user),
    };
  }

  // Private helper method
  private mapToUser(db: any): User {
    validateRequiredFields(db, ["_id"], "user");

    return {
      ...db,
      _id: db._id.toString(),
    };
  }
}