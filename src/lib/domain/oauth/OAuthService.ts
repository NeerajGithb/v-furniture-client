import { IOAuthRepository, User, AuthTokens } from "./IOAuthRepository";
import { OAuthRepository } from "./OAuthRepository";
import { OAuthQueryRequest, OAuthProviderRequest } from "./OAuthSchemas";
import {
  OAuthProviderNotSupportedError,
  OAuthCodeMissingError,
  OAuthTokenExchangeError,
  OAuthUserInfoError,
  OAuthUserEmailMissingError,
} from "./OAuthErrors";
import { RepositoryError } from "../shared/InfrastructureError";

export class OAuthService {
  constructor(private repository: IOAuthRepository = new OAuthRepository()) {}

  // Handle OAuth flow (initiate or callback)
  async handleOAuth(
    query: OAuthQueryRequest,
  ): Promise<
    | { type: "redirect"; url: string }
    | { type: "auth"; user: User; tokens: AuthTokens }
  > {
    try {
      // Determine if this is initiate or callback flow
      const isCallback = query.action === "callback" || !!query.code;

      if (isCallback) {
        return this.handleCallback(query);
      } else {
        return this.handleInitiate(query);
      }
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (
        error instanceof OAuthProviderNotSupportedError ||
        error instanceof OAuthCodeMissingError ||
        error instanceof OAuthTokenExchangeError ||
        error instanceof OAuthUserInfoError ||
        error instanceof OAuthUserEmailMissingError
      ) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("OAuth authentication failed");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Private methods for different flows
  private async handleInitiate(
    query: OAuthQueryRequest,
  ): Promise<{ type: "redirect"; url: string }> {
    if (!this.isSupportedProvider(query.provider)) {
      throw new OAuthProviderNotSupportedError(query.provider);
    }

    try {
      const authUrl = this.repository.getAuthUrl(
        query.provider,
        query.redirectUrl,
      );

      return {
        type: "redirect",
        url: authUrl,
      };
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to initiate OAuth flow");
      }
      throw error; // Re-throw domain errors
    }
  }

  private async handleCallback(
    query: OAuthQueryRequest,
  ): Promise<{ type: "auth"; user: User; tokens: AuthTokens }> {
    // Check for OAuth errors first
    if (query.error) {
      throw new Error(
        `OAuth error: ${query.error}${query.error_description ? ` - ${query.error_description}` : ""}`,
      );
    }

    if (!query.code) {
      throw new OAuthCodeMissingError();
    }

    if (!this.isSupportedProvider(query.provider)) {
      throw new OAuthProviderNotSupportedError(query.provider);
    }

    try {
      // Exchange code for tokens
      let tokens;
      try {
        tokens = await this.repository.exchangeCodeForTokens(
          query.provider,
          query.code,
        );
      } catch (error) {
        throw new OAuthTokenExchangeError(query.provider);
      }

      // Get user info from OAuth provider
      let userInfo;
      try {
        userInfo = await this.repository.getUserInfo(
          query.provider,
          tokens.access_token,
        );
      } catch (error) {
        throw new OAuthUserInfoError(query.provider);
      }

      if (!userInfo.email) {
        throw new OAuthUserEmailMissingError(query.provider);
      }

      // Find or create user
      let user = await this.repository.findUserByEmail(userInfo.email);

      if (!user) {
        // Create new user
        user = await this.repository.createUser({
          name: userInfo.name || "",
          email: userInfo.email,
          photoURL: userInfo.picture,
          hasOAuth: true,
        });
      } else {
        // Update existing user if needed
        const updates: Partial<User> = {};
        let shouldUpdate = false;

        if (!user.hasOAuth) {
          updates.hasOAuth = true;
          shouldUpdate = true;
        }

        if (userInfo.picture && user.photoURL !== userInfo.picture) {
          updates.photoURL = userInfo.picture;
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          user = await this.repository.updateUser(user._id, updates);
        }
      }

      // Create authentication tokens
      const authTokens = this.repository.createAuthTokens(user);

      return {
        type: "auth",
        user,
        tokens: authTokens,
      };
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (
        error instanceof OAuthTokenExchangeError ||
        error instanceof OAuthUserInfoError ||
        error instanceof OAuthUserEmailMissingError
      ) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("OAuth callback processing failed");
      }

      throw error; // Re-throw unknown errors
    }
  }

  private isSupportedProvider(
    provider: string,
  ): provider is OAuthProviderRequest {
    return provider === "google";
  }
}

// Create default instance
export const oauthService = new OAuthService();
