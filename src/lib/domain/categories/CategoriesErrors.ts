import {
  ValidationError,
  NotFoundError,
  BusinessRuleError,
} from "../shared/DomainError";

// Category validation errors
export class CategoryValidationError extends ValidationError {
  readonly code = "CATEGORY_VALIDATION_ERROR";

  constructor(message: string, field?: string) {
    super(message, { field });
  }
}

// Category not found errors
export class CategoryNotFoundError extends NotFoundError {
  readonly code = "CATEGORY_NOT_FOUND";

  constructor(identifier: string) {
    super(`Category not found: ${identifier}`, { identifier });
  }
}

// Subcategory validation errors
export class SubcategoryValidationError extends ValidationError {
  readonly code = "SUBCATEGORY_VALIDATION_ERROR";

  constructor(message: string, field?: string) {
    super(message, { field });
  }
}

// Subcategory not found errors
export class SubcategoryNotFoundError extends NotFoundError {
  readonly code = "SUBCATEGORY_NOT_FOUND";

  constructor(identifier: string) {
    super(`Subcategory not found: ${identifier}`, { identifier });
  }
}

// Categories business rule errors
export class CategoriesBusinessRuleError extends BusinessRuleError {
  readonly code = "CATEGORIES_BUSINESS_RULE_ERROR";

  constructor(message: string) {
    super(message);
  }
}
