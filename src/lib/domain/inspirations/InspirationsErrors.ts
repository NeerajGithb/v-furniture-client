import { NotFoundError } from "../shared/DomainError";

export class InspirationNotFoundError extends NotFoundError {
  readonly code = "INSPIRATION_NOT_FOUND";
  constructor(slug?: string) {
    super("Inspiration not found", { slug });
  }
}

export class CategoryNotFoundError extends NotFoundError {
  readonly code = "CATEGORY_NOT_FOUND";
  constructor(category?: string) {
    super("Category not found", { category });
  }
}
