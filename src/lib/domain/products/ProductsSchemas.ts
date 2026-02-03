import { z } from "zod";

// Base pagination schema
export const ProductsPaginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val || "1", 10))
    .refine((val) => !isNaN(val) && val >= 1, "Page must be positive")
    .default(() => 1),
  limit: z
    .string()
    .transform((val) => parseInt(val || "24", 10))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, "Limit 1-100")
    .default(() => 24),
});

// Products filter schema
export const ProductsFilterSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  minPrice: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine(
      (val) => val === undefined || (!isNaN(val) && val >= 0),
      "Invalid minPrice",
    )
    .optional(),
  maxPrice: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine(
      (val) => val === undefined || (!isNaN(val) && val >= 0),
      "Invalid maxPrice",
    )
    .optional(),
  material: z.string().optional(),
  inStock: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  onSale: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  discount: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine(
      (val) => val === undefined || (!isNaN(val) && val >= 0),
      "Invalid discount",
    )
    .optional(),
  sort: z
    .enum([
      "newest",
      "price-low",
      "price-high",
      "name-asc",
      "name-desc",
      "rating",
      "discount",
    ])
    .default("newest"),
});

// Products query schema (combines pagination and filters)
export const ProductsQuerySchema = ProductsPaginationSchema.merge(
  ProductsFilterSchema,
).extend({
  // Special query modes
  count: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  showcase: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  groupBy: z.enum(["category"]).optional(),
  productsPerCategory: z
    .string()
    .transform((val) => parseInt(val || "10", 10))
    .refine(
      (val) => !isNaN(val) && val >= 1 && val <= 50,
      "ProductsPerCategory 1-50",
    )
    .default(() => 10),
});

// Single product schema
export const ProductByIdSchema = z.object({
  id: z
    .string()
    .min(1, "Product ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
});

// Type exports
export type ProductsQueryRequest = z.infer<typeof ProductsQuerySchema>;
export type ProductsFilterRequest = z.infer<typeof ProductsFilterSchema>;
export type ProductsPaginationRequest = z.infer<
  typeof ProductsPaginationSchema
>;
export type ProductByIdRequest = z.infer<typeof ProductByIdSchema>;
