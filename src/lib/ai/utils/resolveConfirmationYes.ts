import { DecisionResult } from "../decisionLayer";
import { CONFIRMATION_HANDLERS } from "./CONFIRMATION_HANDLERS";
import { AwaitingConfirmation } from "@/types/ai";

export function resolveConfirmationYes(
  awaiting: AwaitingConfirmation,
  decision: DecisionResult
): DecisionResult {
  console.log("[Confirm] resolving yes", {
    awaiting,
    key: awaiting?.sourceAction,
    handlers: Object.keys(CONFIRMATION_HANDLERS),
  });

  const handler = CONFIRMATION_HANDLERS[awaiting?.sourceAction];

  if (handler) {
    const next = { ...decision };
    const resolved = handler(awaiting.payload, next);

    console.log("[Confirm] resolved action:", resolved.action);
    return resolved;
  }

  console.error(
    "[Confirm] NO HANDLER for sourceAction:",
    awaiting?.sourceAction
  );

  return decision;
}