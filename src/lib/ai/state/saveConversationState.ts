// lib/ai/state/saveConversationState.ts
import { redis } from "../redis/client";
import { ConversationState } from "./conversationState";
import { createInitialConversationState } from "./createInitialConversationState";

export async function saveConversationState(
  conversationId: string,
  partial: Partial<ConversationState>,
) {
  const key = `conv:${conversationId}`;

  const existing =
    (await redis.get<ConversationState>(key)) ??
    createInitialConversationState();

  // Deep merge counts instead of replacing
  const mergedCounts =
    partial.counts
      ? { ...(existing.counts || {}), ...partial.counts }
      : existing.counts;

  const next: ConversationState = {
    ...existing,
    ...partial,
    counts: mergedCounts,
    updatedAt: Date.now(),
  };

  await redis.set(key, next, { ex: 7200 });
}
