import {
  NotFoundError,
  BusinessRuleError,
  DuplicateError,
} from "../shared/DomainError";

export class OrderNotFoundError extends NotFoundError {
  readonly code = "ORDER_NOT_FOUND";
  constructor(identifier?: string) {
    super("Order not found", { identifier });
  }
}

export class OrderCannotBeCancelledError extends BusinessRuleError {
  readonly code = "ORDER_CANNOT_BE_CANCELLED";
  constructor(currentStatus: string) {
    super("Order cannot be cancelled at this stage", { currentStatus });
  }
}

export class OrderCannotBeDeletedError extends BusinessRuleError {
  readonly code = "ORDER_CANNOT_BE_DELETED";
  constructor(currentStatus: string) {
    super("Only cancelled or returned orders can be deleted", {
      currentStatus,
    });
  }
}

export class OrderAlreadyCancelledError extends BusinessRuleError {
  readonly code = "ORDER_ALREADY_CANCELLED";
  constructor() {
    super("Order is already cancelled");
  }
}

export class InvalidOrderStatusError extends BusinessRuleError {
  readonly code = "INVALID_ORDER_STATUS";
  constructor(status: string) {
    super("Invalid order status", { status });
  }
}

export class EmptyCartError extends BusinessRuleError {
  readonly code = "EMPTY_CART";
  constructor() {
    super("No items in cart");
  }
}

export class InvalidPaymentMethodError extends BusinessRuleError {
  readonly code = "INVALID_PAYMENT_METHOD";
  constructor(method: string) {
    super("Invalid payment method", { method });
  }
}

export class AddressNotFoundError extends NotFoundError {
  readonly code = "ADDRESS_NOT_FOUND";
  constructor() {
    super("Address not found");
  }
}

export class ProductValidationError extends BusinessRuleError {
  readonly code = "PRODUCT_VALIDATION_ERROR";
  constructor(message: string) {
    super(message);
  }
}

export class CouponValidationError extends BusinessRuleError {
  readonly code = "COUPON_VALIDATION_ERROR";
  constructor(message: string) {
    super(message);
  }
}

export class OrderRateLimitError extends BusinessRuleError {
  readonly code = "ORDER_RATE_LIMIT_EXCEEDED";
  constructor() {
    super("Too many order attempts. Please try again later.");
  }
}
