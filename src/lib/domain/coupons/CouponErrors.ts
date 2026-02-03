import {
  NotFoundError,
  DuplicateError,
  BusinessRuleError,
} from "../shared/DomainError";

export class CouponNotFoundError extends NotFoundError {
  readonly code = "COUPON_NOT_FOUND";
  constructor(id?: string) {
    super("Coupon not found", { id });
  }
}

export class CouponCodeExistsError extends DuplicateError {
  readonly code = "COUPON_CODE_EXISTS";
  constructor(code: string) {
    super("Coupon code already exists", { code });
  }
}

export class CouponExpiredError extends BusinessRuleError {
  readonly code = "COUPON_EXPIRED";
  constructor() {
    super("Coupon has expired");
  }
}

export class CouponUsageLimitReachedError extends BusinessRuleError {
  readonly code = "COUPON_USAGE_LIMIT_REACHED";
  constructor() {
    super("Coupon usage limit reached");
  }
}

export class CouponUserLimitReachedError extends BusinessRuleError {
  readonly code = "COUPON_USER_LIMIT_REACHED";
  constructor() {
    super("You have already used this coupon");
  }
}

export class CouponMinOrderAmountError extends BusinessRuleError {
  readonly code = "COUPON_MIN_ORDER_AMOUNT";
  constructor(minAmount: number) {
    super(`Minimum order amount of ₹${minAmount} required`, { minAmount });
  }
}

export class InvalidCouponCodeError extends BusinessRuleError {
  readonly code = "INVALID_COUPON_CODE";
  constructor() {
    super("Invalid coupon code");
  }
}
