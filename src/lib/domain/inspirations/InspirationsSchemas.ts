import { z } from "zod";

// Base pagination schema
export const InspirationsPaginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val || "1", 10))
    .refine((val) => !isNaN(val) && val >= 1, "Page must be positive")
    .default(() => 1),
  limit: z
    .string()
    .transform((val) => parseInt(val || "12", 10))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 50, "Limit 1-50")
    .default(() => 12),
});

// Inspirations filter schema
export const InspirationsFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
  keyword: z.string().optional(),
});

// Inspirations query schema (combines pagination and filters)
export const InspirationsQuerySchema = InspirationsPaginationSchema.merge(
  InspirationsFilterSchema,
).extend({
  // Special query modes
  relatedProducts: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  slug: z.string().optional(), // For related products
  sort: z.enum(["newest", "oldest", "price-low", "price-high"]).optional(),
});

// Single inspiration schema
export const InspirationBySlugSchema = z.object({
  slug: z.string().min(1, "Inspiration slug is required"),
});

// Related products schema
export const RelatedProductsSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  limit: z
    .string()
    .transform((val) => parseInt(val || "20", 10))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 50, "Limit 1-50")
    .default(() => 20),
  sort: z.enum(["newest", "oldest", "price-low", "price-high"]).optional(),
});

// Type exports
export type InspirationsQueryRequest = z.infer<typeof InspirationsQuerySchema>;
export type InspirationsFilterRequest = z.infer<
  typeof InspirationsFilterSchema
>;
export type InspirationsPaginationRequest = z.infer<
  typeof InspirationsPaginationSchema
>;
export type InspirationBySlugRequest = z.infer<typeof InspirationBySlugSchema>;
export type RelatedProductsRequest = z.infer<typeof RelatedProductsSchema>;
