import { z } from "zod";

// Schema for category slug parameter
export const CategorySlugSchema = z.object({
  slug: z
    .string()
    .min(1, "Category slug is required")
    .regex(/^[a-z0-9-]+$/, "Invalid slug format")
    .trim()
    .toLowerCase(),
});

// Schema for pagination (used by both categories and subcategories)
export const PaginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a number")
    .transform((val) => Math.max(1, parseInt(val, 10)))
    .default(() => 1),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform((val) => Math.min(100, Math.max(1, parseInt(val, 10))))
    .default(() => 20),
});

// Type exports for use in services
export type CategorySlugData = z.infer<typeof CategorySlugSchema>;
export type PaginationData = z.infer<typeof PaginationSchema>;
