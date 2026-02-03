import { z } from "zod";

// Razorpay Webhook Payload Schema
export const RazorpayWebhookSchema = z
  .object({
    event: z.string().min(1, "Event type is required"),
    event_id: z.string().optional(),
    payload: z
      .object({
        payment: z
          .object({
            entity: z
              .object({
                id: z.string().min(1, "Payment ID is required"),
                order_id: z.string().min(1, "Order ID is required"),
                status: z.string().optional(),
                error_description: z.string().optional(),
              })
              .passthrough(), // Allow additional properties
          })
          .passthrough(),
      })
      .passthrough(),
  })
  .passthrough(); // Allow additional properties for flexibility

// Webhook Event Schema
export const WebhookEventSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  eventType: z.string().min(1, "Event type is required"),
  gateway: z.enum(["razorpay"]),
  payload: z.record(z.string(), z.any()),
  processed: z.boolean().default(false),
});

// Webhook Signature Validation Schema
export const WebhookSignatureSchema = z.object({
  signature: z.string().min(1, "Signature is required"),
  rawBody: z.string().min(1, "Raw body is required"),
});

// Type exports
export type RazorpayWebhookRequest = z.infer<typeof RazorpayWebhookSchema>;
export type WebhookEventRequest = z.infer<typeof WebhookEventSchema>;
export type WebhookSignatureRequest = z.infer<typeof WebhookSignatureSchema>;
