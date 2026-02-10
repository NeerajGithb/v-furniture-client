import {
  NotFoundError,
  BusinessRuleError,
  DuplicateError,
} from "../shared/DomainError";

export class PaymentNotFoundError extends NotFoundError {
  readonly code = "PAYMENT_NOT_FOUND";
  constructor(identifier?: string) {
    super(
      identifier ? `Payment not found: ${identifier}` : "Payment not found",
      { identifier }
    );
  }
}

export class OrderNotFoundError extends NotFoundError {
  readonly code = "ORDER_NOT_FOUND";
  constructor(orderId?: string) {
    super(
      orderId ? `Order not found: ${orderId}` : "Order not found",
      { orderId }
    );
  }
}

export class InvalidPaymentMethodError extends BusinessRuleError {
  readonly code = "INVALID_PAYMENT_METHOD";
  constructor(method: string) {
    super(`Invalid payment method: ${method}`, { method });
  }
}

export class OrderNotEligibleForPaymentError extends BusinessRuleError {
  readonly code = "ORDER_NOT_ELIGIBLE_FOR_PAYMENT";
  constructor(reason: string) {
    super(`Order is not eligible for payment: ${reason}`, { reason });
  }
}

export class PaymentAlreadyProcessedError extends BusinessRuleError {
  readonly code = "PAYMENT_ALREADY_PROCESSED";
  constructor() {
    super("Payment has already been processed for this order");
  }
}

export class PaymentVerificationFailedError extends BusinessRuleError {
  readonly code = "PAYMENT_VERIFICATION_FAILED";
  constructor(reason: string) {
    super(`Payment verification failed: ${reason}`, { reason });
  }
}

export class RazorpayOrderCreationError extends BusinessRuleError {
  readonly code = "RAZORPAY_ORDER_CREATION_FAILED";
  constructor(message: string) {
    super(`Failed to create Razorpay order: ${message}`, { originalError: message });
  }
}

export class InvalidSignatureError extends BusinessRuleError {
  readonly code = "INVALID_SIGNATURE";
  constructor() {
    super("Invalid payment signature");
  }
}

export class PaymentRateLimitError extends BusinessRuleError {
  readonly code = "PAYMENT_RATE_LIMIT_EXCEEDED";
  constructor() {
    super("Too many payment attempts. Please try again later.");
  }
}
