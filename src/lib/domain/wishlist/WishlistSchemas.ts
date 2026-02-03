import { z } from "zod";

// Add to wishlist schema
export const AddToWishlistSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
});

// Remove from wishlist schema
export const RemoveFromWishlistSchema = z
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

// Batch remove from wishlist schema
export const BatchRemoveFromWishlistSchema = z.object({
  productIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"))
    .min(1, "At least one product ID is required")
    .max(50, "Cannot remove more than 50 products at once"),
});

// Check products in wishlist schema
export const CheckWishlistSchema = z.object({
  productIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"))
    .min(1, "At least one product ID is required")
    .max(50, "Cannot check more than 50 products at once"),
});

// Standard pagination schema (consistent with other domains)
export const PaginationSchema = z.object({
  page: z
    .string()
    .nullable()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine(
      (val) => !isNaN(val) && val >= 1,
      "Page must be a positive integer",
    ),

  limit: z
    .string()
    .nullable()
    .transform((val) => (val ? parseInt(val, 10) : 12))
    .refine(
      (val) => !isNaN(val) && val >= 1 && val <= 50,
      "Limit must be between 1 and 50",
    ),
});

// Legacy pagination schema for backward compatibility
export const WishlistPaginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1, "Page must be a positive integer")
    .default(() => 1),

  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine(
      (val) => !isNaN(val) && val >= 1 && val <= 50,
      "Limit must be between 1 and 50",
    )
    .default(() => 12),
});

// Type inference from schemas
export type AddToWishlistRequest = z.infer<typeof AddToWishlistSchema>;
export type RemoveFromWishlistRequest = z.infer<
  typeof RemoveFromWishlistSchema
>;
export type BatchRemoveFromWishlistRequest = z.infer<
  typeof BatchRemoveFromWishlistSchema
>;
export type CheckWishlistRequest = z.infer<typeof CheckWishlistSchema>;
export type PaginationRequest = z.infer<typeof PaginationSchema>;
export type WishlistPaginationRequest = z.infer<
  typeof WishlistPaginationSchema
>;
