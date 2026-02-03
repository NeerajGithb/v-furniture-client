import { BusinessRuleError, NotFoundError } from "../shared/DomainError";

export class OAuthProviderNotSupportedError extends BusinessRuleError {
  readonly code = "OAUTH_PROVIDER_NOT_SUPPORTED";
  constructor(provider?: string) {
    super("OAuth provider not supported", { provider });
  }
}

export class OAuthCodeMissingError extends BusinessRuleError {
  readonly code = "OAUTH_CODE_MISSING";
  constructor() {
    super("Authorization code is missing from OAuth callback");
  }
}

export class OAuthTokenExchangeError extends BusinessRuleError {
  readonly code = "OAUTH_TOKEN_EXCHANGE_FAILED";
  constructor(provider?: string) {
    super("Failed to exchange authorization code for tokens", { provider });
  }
}

export class OAuthUserInfoError extends BusinessRuleError {
  readonly code = "OAUTH_USER_INFO_FAILED";
  constructor(provider?: string) {
    super("Failed to fetch user information from OAuth provider", { provider });
  }
}

export class OAuthUserEmailMissingError extends BusinessRuleError {
  readonly code = "OAUTH_USER_EMAIL_MISSING";
  constructor(provider?: string) {
    super("Email address not provided by OAuth provider", { provider });
  }
}
