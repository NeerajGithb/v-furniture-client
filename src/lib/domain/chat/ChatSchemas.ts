import { z } from "zod";

// Chat Message Schema
export const ChatMessageSchema = z.object({
  message: z.string().min(1, "Message is required").trim(),
  history: z.array(z.any()).optional().default([]),
  conversationId: z.string().optional(),
});

// Chat Understanding Schema (for AI processing)
export const ChatUnderstandingSchema = z.object({
  coarse_intent: z.string().optional(),
  whatUserWants: z.string().optional(),
  fine_intent: z.string().optional(),
  confidence: z.number().optional(),
  action_type: z.string().optional(),
  entities: z.record(z.string(), z.any()).optional(),
  constraints: z.record(z.string(), z.any()).optional(),
  info_type: z.string().optional(),
  info_entity: z.string().optional(),
  confirmation: z.boolean().optional(),
  question_type: z
    .object({
      expects_yes_no: z.boolean().optional(),
    })
    .optional(),
});

// Chat Decision Schema
export const ChatDecisionSchema = z.object({
  action: z.string(),
  actionType: z.string().optional(),
  shouldFetchProducts: z.boolean().optional(),
  shouldNavigate: z.boolean().optional(),
  shouldFetchStats: z.boolean().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  productSlug: z.string().optional(),
  productId: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional(),
  pendingBrowse: z.boolean().optional(),
  index: z.number().optional(),
});

// Business Logic Request Schema
export const BusinessLogicRequestSchema = z.object({
  action: z.string(),
  actionType: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional(),
  infoEntity: z.string().optional(),
  productId: z.string().optional(),
  productSlug: z.string().optional(),
  userId: z.string().optional(),
});

// Type exports
export type ChatMessageRequest = z.infer<typeof ChatMessageSchema>;
export type ChatUnderstandingRequest = z.infer<typeof ChatUnderstandingSchema>;
export type ChatDecisionRequest = z.infer<typeof ChatDecisionSchema>;
export type BusinessLogicRequest = z.infer<typeof BusinessLogicRequestSchema>;
