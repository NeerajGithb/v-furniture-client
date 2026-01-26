// lib/ai/state/saveConversationState.ts
import { redis } from "../redis/client";
import { ConversationState } from "./conversationState";
import { createInitialConversationState } from "./createInitialConversationState";

export async function saveConversationState(
  conversationId: string,
  partial: Partial<ConversationState>
) {
  const key = `conv:${conversationId}`;

  const existing =
    (await redis.get<ConversationState>(key)) ??
    createInitialConversationState();

  const next: ConversationState = {
    ...existing,
    ...partial,
    updatedAt: Date.now(),
  };

  await redis.set(key, next, { ex: 7200 });
}