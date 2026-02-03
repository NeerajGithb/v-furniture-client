import { NotFoundError, BusinessRuleError } from "../shared/DomainError";

export class NotificationNotFoundError extends NotFoundError {
  readonly code = "NOTIFICATION_NOT_FOUND";
  constructor(id?: string) {
    super("Notification not found", { id });
  }
}

export class InvalidNotificationActionError extends BusinessRuleError {
  readonly code = "INVALID_NOTIFICATION_ACTION";
  constructor(action?: string) {
    super("Invalid notification action", { action });
  }
}
