import {
  NotFoundError,
  BusinessRuleError,
  DuplicateError,
} from "../shared/DomainError";

export class ReviewNotFoundError extends NotFoundError {
  readonly code = "REVIEW_NOT_FOUND";
  constructor(reviewId?: string) {
    super("Review not found", { reviewId });
  }
}

export class ProductNotFoundError extends NotFoundError {
  readonly code = "PRODUCT_NOT_FOUND";
  constructor(productId?: string) {
    super("Product not found", { productId });
  }
}

export class ReviewAlreadyExistsError extends DuplicateError {
  readonly code = "REVIEW_ALREADY_EXISTS";
  constructor() {
    super("You have already reviewed this product");
  }
}

export class UnauthorizedReviewActionError extends BusinessRuleError {
  readonly code = "UNAUTHORIZED_REVIEW_ACTION";
  constructor(action: string) {
    super(`You are not authorized to ${action} this review`);
  }
}

export class InvalidRatingError extends BusinessRuleError {
  readonly code = "INVALID_RATING";
  constructor() {
    super("Rating must be between 1 and 5");
  }
}

export class InvalidCommentError extends BusinessRuleError {
  readonly code = "INVALID_COMMENT";
  constructor() {
    super("Comment must be at least 10 characters long");
  }
}

export class InvalidProductIdError extends BusinessRuleError {
  readonly code = "INVALID_PRODUCT_ID";
  constructor() {
    super("Invalid product ID format");
  }
}

export class InvalidReviewIdError extends BusinessRuleError {
  readonly code = "INVALID_REVIEW_ID";
  constructor() {
    super("Invalid review ID format");
  }
}

export class SelfReportError extends BusinessRuleError {
  readonly code = "SELF_REPORT_ERROR";
  constructor() {
    super("You cannot report your own review");
  }
}

export class DuplicateVoteError extends BusinessRuleError {
  readonly code = "DUPLICATE_VOTE_ERROR";
  constructor() {
    super("You have already voted on this review");
  }
}
