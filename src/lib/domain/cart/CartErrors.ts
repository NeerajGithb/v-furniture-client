import { NotFoundError, BusinessRuleError } from "../shared/DomainError";

export class CartNotFoundError extends NotFoundError {
  readonly code = "CART_NOT_FOUND";

  constructor(userId?: string) {
    super("Cart not found", { userId });
  }
}

export class CartItemNotFoundError extends NotFoundError {
  readonly code = "CART_ITEM_NOT_FOUND";

  constructor(productId?: string) {
    super("Item not found in cart", { productId });
  }
}

export class ProductNotFoundError extends NotFoundError {
  readonly code = "PRODUCT_NOT_FOUND";

  constructor(productId?: string) {
    super("Product not found", { productId });
  }
}

export class InsufficientStockError extends BusinessRuleError {
  readonly code = "INSUFFICIENT_STOCK";

  constructor(
    message: string = "Insufficient stock available",
    availableStock?: number,
  ) {
    super(message, { availableStock });
  }
}
