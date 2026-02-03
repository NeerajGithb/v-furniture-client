import { OAuthProviderRequest, OAuthCallbackRequest } from "./OAuthSchemas";

export interface User {
  _id: string;
  name: string;
  email: string;
  photoURL?: string;
  password?: string;
  hasOAuth: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface OAuthUserInfo {
  email: string;
  name?: string;
  picture?: string;
  id?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IOAuthRepository {
  // OAuth provider operations
  getAuthUrl(provider: OAuthProviderRequest, redirectUrl?: string): string;
  exchangeCodeForTokens(
    provider: OAuthProviderRequest,
    code: string,
  ): Promise<OAuthTokens>;
  getUserInfo(
    provider: OAuthProviderRequest,
    accessToken: string,
  ): Promise<OAuthUserInfo>;

  // User operations
  findUserByEmail(email: string): Promise<User | null>;
  createUser(userData: {
    name: string;
    email: string;
    photoURL?: string;
    hasOAuth: boolean;
  }): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;

  // Auth token operations
  createAuthTokens(user: User): AuthTokens;
}
