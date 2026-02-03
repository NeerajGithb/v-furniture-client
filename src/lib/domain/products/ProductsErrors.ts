import { NotFoundError, BusinessRuleError } from "../shared/DomainError";

export class ProductNotFoundError extends NotFoundError {
  readonly code = "PRODUCT_NOT_FOUND";
  constructor(id?: string) {
    super("Product not found", { id });
  }
}

export class CategoryNotFoundError extends NotFoundError {
  readonly code = "CATEGORY_NOT_FOUND";
  constructor(category?: string) {
    super("Category not found", { category });
  }
}

export class SubcategoryNotFoundError extends NotFoundError {
  readonly code = "SUBCATEGORY_NOT_FOUND";
  constructor(subcategory?: string) {
    super("Subcategory not found", { subcategory });
  }
}

export class InvalidPriceRangeError extends BusinessRuleError {
  readonly code = "INVALID_PRICE_RANGE";
  constructor() {
    super("Maximum price must be greater than minimum price");
  }
}
