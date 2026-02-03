import { z } from "zod";

// Search Query Schema
export const SearchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required").trim(),
  page: z
    .string()
    .transform((val) => parseInt(val || "1", 10))
    .refine((val) => !isNaN(val) && val >= 1, "Page must be positive")
    .default(() => 1),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val || "24", 10), 100))
    .refine((val) => !isNaN(val) && val >= 1, "Limit must be positive")
    .default(() => 24),
});

// Autocomplete Query Schema
export const AutocompleteQuerySchema = z.object({
  q: z.string().min(2, "Query must be at least 2 characters").trim(),
});

// Search Analytics Schema
export const SearchAnalyticsSchema = z.object({
  action: z.enum([
    "track_click",
    "track_view",
    "track_add_to_cart",
    "track_add_to_wishlist",
    "track_purchase",
    "track_filter",
    "track_sort",
    "track_page",
    "track_zero_click",
  ]),
  data: z.object({
    query: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    productId: z.string().optional(),
    position: z.number().optional(),
    resultsCount: z.number().optional(),
    searchTime: z.number().optional(),
    filters: z.record(z.string(), z.any()).optional(),
    context: z
      .object({
        region: z.string().optional(),
        device: z.enum(["mobile", "desktop", "tablet"]).optional(),
        userId: z.string().optional(),
        sessionId: z.string().optional(),
      })
      .optional(),
  }),
});

// Search Context Schema
export const SearchContextSchema = z.object({
  region: z.string().optional().default("IN"),
  device: z.enum(["mobile", "desktop", "tablet"]).optional().default("desktop"),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

// Type exports
export type SearchQueryRequest = z.infer<typeof SearchQuerySchema>;
export type AutocompleteQueryRequest = z.infer<typeof AutocompleteQuerySchema>;
export type SearchAnalyticsRequest = z.infer<typeof SearchAnalyticsSchema>;
export type SearchContextRequest = z.infer<typeof SearchContextSchema>;
