// lib/state/getConversationState.ts
import { redis } from "../redis/client";
import { ConversationState } from "./conversationState";
import { createInitialConversationState } from "./createInitialConversationState";

export async function getConversationState(
  conversationId: string
): Promise<ConversationState> {
  const state = await redis.get<ConversationState>(`conv:${conversationId}`);

  if (!state) {
    const initial = createInitialConversationState();
    await redis.set(`conv:${conversationId}`, initial);
    return initial;
  }

  return state;
}