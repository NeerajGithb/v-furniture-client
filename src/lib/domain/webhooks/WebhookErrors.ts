import { NotFoundError, BusinessRuleError } from "../shared/DomainError";

export class MissingWebhookSignatureError extends BusinessRuleError {
  readonly code = "MISSING_WEBHOOK_SIGNATURE";
  constructor() {
    super("Missing webhook signature");
  }
}

export class InvalidWebhookSignatureError extends BusinessRuleError {
  readonly code = "INVALID_WEBHOOK_SIGNATURE";
  constructor() {
    super("Invalid webhook signature");
  }
}

export class InvalidWebhookPayloadError extends BusinessRuleError {
  readonly code = "INVALID_WEBHOOK_PAYLOAD";
  constructor(message: string = "Invalid webhook payload") {
    super(message);
  }
}

export class DuplicateWebhookEventError extends BusinessRuleError {
  readonly code = "DUPLICATE_WEBHOOK_EVENT";
  constructor(eventId: string) {
    super(`Duplicate webhook event: ${eventId}`);
  }
}

export class PaymentNotFoundError extends NotFoundError {
  readonly code = "PAYMENT_NOT_FOUND";
  constructor(orderId: string) {
    super(`Payment not found for order: ${orderId}`);
  }
}

export class WebhookProcessingError extends BusinessRuleError {
  readonly code = "WEBHOOK_PROCESSING_ERROR";
  constructor(message: string = "Webhook processing failed") {
    super(message);
  }
}

export class UnsupportedWebhookEventError extends BusinessRuleError {
  readonly code = "UNSUPPORTED_WEBHOOK_EVENT";
  constructor(eventType: string) {
    super(`Unsupported webhook event type: ${eventType}`);
  }
}
