import { NotFoundError, BusinessRuleError } from "../shared/DomainError";

export class InvalidChatMessageError extends BusinessRuleError {
  readonly code = "INVALID_CHAT_MESSAGE";
  constructor() {
    super("Valid message is required");
  }
}

export class ChatProcessingError extends BusinessRuleError {
  readonly code = "CHAT_PROCESSING_ERROR";
  constructor(message: string = "Failed to process chat message") {
    super(message);
  }
}

export class AuthenticationRequiredError extends BusinessRuleError {
  readonly code = "AUTHENTICATION_REQUIRED";
  constructor(action: string) {
    super(`Authentication required for action: ${action}`);
  }
}

export class ConversationStateError extends BusinessRuleError {
  readonly code = "CONVERSATION_STATE_ERROR";
  constructor(message: string = "Failed to manage conversation state") {
    super(message);
  }
}

export class AIServiceError extends BusinessRuleError {
  readonly code = "AI_SERVICE_ERROR";
  constructor(service: string, message: string = "AI service failed") {
    super(`${service}: ${message}`);
  }
}

export class BusinessLogicExecutionError extends BusinessRuleError {
  readonly code = "BUSINESS_LOGIC_EXECUTION_ERROR";
  constructor(
    action: string,
    message: string = "Business logic execution failed",
  ) {
    super(`Action ${action}: ${message}`);
  }
}
