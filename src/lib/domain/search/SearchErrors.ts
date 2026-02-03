import { NotFoundError, BusinessRuleError } from "../shared/DomainError";

export class SearchQueryTooShortError extends BusinessRuleError {
  readonly code = "SEARCH_QUERY_TOO_SHORT";
  constructor() {
    super("Search query must be at least 2 characters long");
  }
}

export class SearchEngineError extends BusinessRuleError {
  readonly code = "SEARCH_ENGINE_ERROR";
  constructor(message: string = "Search engine failed to process query") {
    super(message);
  }
}

export class AutocompleteError extends BusinessRuleError {
  readonly code = "AUTOCOMPLETE_ERROR";
  constructor(message: string = "Autocomplete service failed") {
    super(message);
  }
}

export class SearchAnalyticsError extends BusinessRuleError {
  readonly code = "SEARCH_ANALYTICS_ERROR";
  constructor(message: string = "Search analytics tracking failed") {
    super(message);
  }
}

export class InvalidSearchActionError extends BusinessRuleError {
  readonly code = "INVALID_SEARCH_ACTION";
  constructor(action: string) {
    super(`Invalid search action: ${action}`);
  }
}
