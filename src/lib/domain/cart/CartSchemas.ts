import { z } from "zod";

// Variant schema for product variants
const VariantSchema = z
  .object({
    color: z.string().optional(),
    size: z.string().optional(),
    sku: z.string().optional(),
  })
  .optional();

// Add to cart schema
export const AddToCartSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100")
    .default(1),

  selectedVariant: VariantSchema,
});

// Update cart schema
export const UpdateCartSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be negative")
    .max(100, "Quantity cannot exceed 100"),
});

// Remove from cart schema
export const RemoveFromCartSchema = z
  .object({
    productId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format")
      .nullable()
      .optional(),

    clearAll: z.boolean().default(false),
  })
  .refine((data) => data.productId || data.clearAll, {
    message: "Either productId or clearAll must be provided",
    path: ["productId"],
  });

// Check products in cart schema
export const CheckProductsSchema = z.object({
  productIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"))
    .min(1, "At least one product ID is required")
    .max(50, "Cannot check more than 50 products at once"),
});

// Type inference from schemas
export type AddToCartRequest = z.infer<typeof AddToCartSchema>;
export type UpdateCartRequest = z.infer<typeof UpdateCartSchema>;
export type RemoveFromCartRequest = z.infer<typeof RemoveFromCartSchema>;
export type CheckProductsRequest = z.infer<typeof CheckProductsSchema>;
