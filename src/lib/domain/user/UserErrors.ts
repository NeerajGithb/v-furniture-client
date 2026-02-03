import { NotFoundError, BusinessRuleError } from "../shared/DomainError";

export class UserNotFoundError extends NotFoundError {
  readonly code = "USER_NOT_FOUND";
  constructor(userId?: string) {
    super("User not found", { userId });
  }
}

export class InvalidUserNameError extends BusinessRuleError {
  readonly code = "INVALID_USER_NAME";
  constructor() {
    super("Name is required and cannot be empty");
  }
}

export class InvalidPhoneNumberError extends BusinessRuleError {
  readonly code = "INVALID_PHONE_NUMBER";
  constructor() {
    super("Please enter a valid phone number");
  }
}

export class UserProfileUpdateError extends BusinessRuleError {
  readonly code = "USER_PROFILE_UPDATE_ERROR";
  constructor(message: string = "Failed to update user profile") {
    super(message);
  }
}
