import { DecisionResult } from "../decisionLayer";
import { CONFIRMATION_HANDLERS } from "./CONFIRMATION_HANDLERS";
import { AwaitingConfirmation } from "@/types/ai";

export function resolveConfirmationYes(
  awaiting: AwaitingConfirmation,
  decision: DecisionResult,
): DecisionResult {
  const handler = CONFIRMATION_HANDLERS[awaiting?.sourceAction];

  if (handler) {
    const next = { ...decision };
    const resolved = handler(awaiting.payload, next);

    return resolved;
  }

  return decision;
}
