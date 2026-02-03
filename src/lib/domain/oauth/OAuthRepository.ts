import {
  IOAuthRepository,
  User,
  OAuthTokens,
  OAuthUserInfo,
  AuthTokens,
} from "./IOAuthRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import { OAuthProviderRequest } from "./OAuthSchemas";
import { validateRequiredFields } from "../shared/mapperUtils";
import { withTransaction } from "@/lib/utils/transaction";
import { connectDB } from "@/lib/dbConnect";
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
  getAuthUrl(provider: OAuthProviderRequest, redirectUrl?: string): string {
    try {
      switch (provider) {
        case "google":
          return getGoogleAuthUrl();
        default:
          throw new Error(`Unsupported OAuth provider: ${provider}`);
      }
    } catch (error) {
      throw new RepositoryError(
        "Failed to get OAuth authorization URL",
        error as Error,
      );
    }
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(
    provider: OAuthProviderRequest,
    code: string,
  ): Promise<OAuthTokens> {
    try {
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
    } catch (error) {
      throw new RepositoryError(
        "Failed to exchange code for tokens",
        error as Error,
      );
    }
  }

  // Get user information from OAuth provider
  async getUserInfo(
    provider: OAuthProviderRequest,
    accessToken: string,
  ): Promise<OAuthUserInfo> {
    try {
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
    } catch (error) {
      throw new RepositoryError(
        "Failed to get user information",
        error as Error,
      );
    }
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      

      const user = await UserModel.findOne({ email }).lean();
      return user ? this.mapToUser(user) : null;
    } catch (error) {
      throw new RepositoryError("Failed to find user by email", error as Error);
    }
  }

  // Create new user with transaction support
  async createUser(userData: {
    name: string;
    email: string;
    photoURL?: string;
    hasOAuth: boolean;
  }): Promise<User> {
    try {
      

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
    } catch (error) {
      throw new RepositoryError("Failed to create user", error as Error);
    }
  }

  // Update user with transaction support
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      

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
    } catch (error) {
      throw new RepositoryError("Failed to update user", error as Error);
    }
  }

  // Create authentication tokens
  createAuthTokens(user: User): AuthTokens {
    try {
      return {
        accessToken: createAccessToken(user),
        refreshToken: createRefreshToken(user),
      };
    } catch (error) {
      throw new RepositoryError("Failed to create auth tokens", error as Error);
    }
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
