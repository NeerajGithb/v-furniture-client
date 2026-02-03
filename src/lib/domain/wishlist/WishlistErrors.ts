import {
  ValidationError,
  NotFoundError,
  DuplicateError,
} from "../shared/DomainError";

export class WishlistValidationError extends ValidationError {
  readonly code = "WISHLIST_VALIDATION_ERROR";

  constructor(message: string, field?: string) {
    super(message, { field });
  }
}

export class WishlistNotFoundError extends NotFoundError {
  readonly code = "WISHLIST_NOT_FOUND";

  constructor(userId?: string) {
    super("Wishlist not found", { userId });
  }
}

export class WishlistItemNotFoundError extends NotFoundError {
  readonly code = "WISHLIST_ITEM_NOT_FOUND";

  constructor(productId?: string) {
    super("Product not found in wishlist", { productId });
  }
}

export class ProductNotFoundError extends NotFoundError {
  readonly code = "PRODUCT_NOT_FOUND";

  constructor(productId?: string) {
    super("Product not found", { productId });
  }
}

export class ProductAlreadyInWishlistError extends DuplicateError {
  readonly code = "PRODUCT_ALREADY_IN_WISHLIST";

  constructor(productId?: string) {
    super("Product already in wishlist", { productId });
  }
}
