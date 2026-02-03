import { z } from "zod";

// Image Schema
const ImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  publicId: z.string().min(1, "Public ID is required"),
  alt: z.string().optional(),
});

// Create Review Schema
export const CreateReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  orderId: z.string().optional(),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z.string().optional(),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters long")
    .trim(),
  images: z.array(ImageSchema).optional().default([]),
});

// Update Review Schema
export const UpdateReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z.string().optional(),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters long")
    .trim(),
  images: z.array(ImageSchema).optional().default([]),
});

// Review Query Schema
export const ReviewQuerySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  page: z
    .string()
    .transform((val) => parseInt(val || "1", 10))
    .refine((val) => !isNaN(val) && val >= 1, "Page must be positive")
    .default(() => 1),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val || "10", 10), 50))
    .refine((val) => !isNaN(val) && val >= 1, "Limit must be positive")
    .default(() => 10),
  rating: z.string().optional(),
  sort: z
    .enum(["newest", "oldest", "highest", "lowest", "helpful"])
    .optional()
    .default("newest"),
});

// Vote Review Schema
export const VoteReviewSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  action: z.enum(["helpful", "unhelpful"], {
    message: "Action must be helpful or unhelpful",
  }),
});

// Report Review Schema
export const ReportReviewSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
});

// Review Action Schema (for consolidated routes)
export const ReviewActionSchema = z.object({
  action: z.enum(["vote", "report"]),
  reviewId: z.string().min(1, "Review ID is required"),
  voteType: z.enum(["helpful", "unhelpful"]).optional(),
});

// Review ID Schema
export const ReviewIdSchema = z.string().min(1, "Review ID is required");

// Type exports
export type CreateReviewRequest = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewRequest = z.infer<typeof UpdateReviewSchema>;
export type ReviewQueryRequest = z.infer<typeof ReviewQuerySchema>;
export type VoteReviewRequest = z.infer<typeof VoteReviewSchema>;
export type ReportReviewRequest = z.infer<typeof ReportReviewSchema>;
export type ReviewActionRequest = z.infer<typeof ReviewActionSchema>;
export type ReviewIdRequest = z.infer<typeof ReviewIdSchema>;
