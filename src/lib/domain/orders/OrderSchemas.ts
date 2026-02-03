import { z } from "zod";

// Create Order Schema
export const CreateOrderSchema = z.object({
  addressId: z.string().min(1, "Address ID is required"),
  paymentMethod: z.enum(["cod", "razorpay"]),
  selectedItems: z
    .array(z.string().min(1))
    .min(1, "At least one item must be selected"),
  cartData: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
        price: z.number().min(0),
        originalPrice: z.number().min(0).optional(),
        name: z.string().min(1),
        sku: z.string().optional(),
        itemId: z.string().optional(),
        selectedVariant: z.any().optional(),
        productImage: z.string().optional(),
        discount: z.number().min(0).optional(),
        discountPercent: z.number().min(0).max(100).optional(),
      }),
    )
    .min(1, "Cart data is required"),
  insuranceEnabled: z.array(z.string()).optional().default([]),
  couponCode: z.string().optional(),
});

// Update Order Schema
export const UpdateOrderSchema = z.object({
  action: z.enum(["cancel", "update_status", "update_notes"]).optional(),
  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// Order Query Schema
export const OrderQuerySchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val || "1", 10) : val;
      return isNaN(num) ? 1 : num;
    })
    .refine((val) => val >= 1, "Page must be positive")
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val || "10", 10) : val;
      return isNaN(num) ? 10 : num;
    })
    .refine(
      (val) => val >= 1 && val <= 100,
      "Limit must be between 1-100",
    )
    .default(10),
  status: z.string().optional(),
  orderNumber: z.string().optional(),
  lookup: z.enum(["id", "orderNumber"]).optional(),
});

// Order ID Schema
export const OrderIdSchema = z.string().min(1, "Order ID is required");

// Order Number Schema
export const OrderNumberSchema = z.string().min(1, "Order number is required");

// Type exports
export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderRequest = z.infer<typeof UpdateOrderSchema>;
export type OrderQueryRequest = z.infer<typeof OrderQuerySchema>;
export type OrderIdRequest = z.infer<typeof OrderIdSchema>;
export type OrderNumberRequest = z.infer<typeof OrderNumberSchema>;
