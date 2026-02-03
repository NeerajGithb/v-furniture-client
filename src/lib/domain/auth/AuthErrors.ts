import {
  NotFoundError,
  BusinessRuleError,
  UnauthorizedError,
} from "../shared/DomainError";

export class UserNotFoundError extends NotFoundError {
  readonly code = "USER_NOT_FOUND";
  constructor(email?: string) {
    super("No account exists with this email. Please sign up first.", {
      email,
    });
  }
}

export class EmailAlreadyExistsError extends BusinessRuleError {
  readonly code = "EMAIL_ALREADY_EXISTS";
  constructor(email: string) {
    super("Email already exists. Try logging in instead.", { email });
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  readonly code = "INVALID_CREDENTIALS";
  constructor(remainingAttempts?: number) {
    super("The password you entered is incorrect. Please try again.", {
      remainingAttempts,
    });
  }
}

export class AccountLockedError extends BusinessRuleError {
  readonly code = "ACCOUNT_LOCKED";
  constructor(remainingMinutes: number) {
    super(
      `Account is locked due to too many failed login attempts. Try again in ${remainingMinutes} minutes.`,
      { remainingMinutes },
    );
  }
}

export class EmailNotVerifiedError extends BusinessRuleError {
  readonly code = "EMAIL_NOT_VERIFIED";
  constructor() {
    super("Please verify your email before logging in");
  }
}

export class RateLimitExceededError extends BusinessRuleError {
  readonly code = "RATE_LIMIT_EXCEEDED";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidVerificationCodeError extends BusinessRuleError {
  readonly code = "INVALID_VERIFICATION_CODE";
  constructor(attemptsRemaining?: number) {
    super("Invalid or expired verification code", { attemptsRemaining });
  }
}

export class PendingRegistrationNotFoundError extends NotFoundError {
  readonly code = "PENDING_REGISTRATION_NOT_FOUND";
  constructor() {
    super(
      "Your registration session has expired. Please start the signup process again.",
    );
  }
}

export class InvalidResetCodeError extends BusinessRuleError {
  readonly code = "INVALID_RESET_CODE";
  constructor() {
    super("Invalid or expired reset code");
  }
}

export class WeakPasswordError extends BusinessRuleError {
  readonly code = "WEAK_PASSWORD";
  constructor(errors: string[]) {
    super("Password does not meet requirements", { errors });
  }
}

export class InvalidTokenError extends UnauthorizedError {
  readonly code = "INVALID_TOKEN";
  constructor(message: string = "Invalid or expired token") {
    super(message);
  }
}

export class MissingTokenError extends UnauthorizedError {
  readonly code = "MISSING_TOKEN";
  constructor(message: string = "Access token missing") {
    super(message);
  }
}
