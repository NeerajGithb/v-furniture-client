import { z } from "zod";

// Create Payment Schema
export const CreatePaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentMethod: z.enum(["cod", "razorpay"], {
    message: "Payment method must be cod or razorpay",
  }),
  idempotencyKey: z.string().optional(),
});

// Verify Payment Schema
export const VerifyPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay signature is required"),
});

// Payment Query Schema
export const PaymentQuerySchema = z
  .object({
    paymentId: z.string().optional(),
    orderId: z.string().optional(),
  })
  .refine((data) => data.paymentId || data.orderId, {
    message: "Either paymentId or orderId is required",
    path: ["paymentId"],
  });

// Payment ID Schema
export const PaymentIdSchema = z.string().min(1, "Payment ID is required");

// Type exports
export type CreatePaymentRequest = z.infer<typeof CreatePaymentSchema>;
export type VerifyPaymentRequest = z.infer<typeof VerifyPaymentSchema>;
export type PaymentQueryRequest = z.infer<typeof PaymentQuerySchema>;
export type PaymentIdRequest = z.infer<typeof PaymentIdSchema>;
