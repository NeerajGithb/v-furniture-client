import { z } from "zod";

// Get notifications schema
export const GetNotificationsSchema = z.object({
  limit: z
    .string()
    .transform((val) => parseInt(val || "50", 10))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, "Limit 1-100")
    .default(() => 50),
  includeRead: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

// Create notification schema
export const CreateNotificationSchema = z
  .object({
    sellerId: z.string().optional(),
    userId: z.string().optional(),
    type: z.string().min(1, "Type is required"),
    subType: z.string().min(1, "SubType is required"),
    priority: z.number().min(1).max(5).default(3),
    title: z.string().min(1, "Title is required").max(200),
    message: z.string().min(1, "Message is required").max(1000),
    link: z.string().url().optional(),
    actions: z
      .array(
        z.object({
          label: z.string(),
          action: z.string(),
          style: z.enum(["primary", "secondary", "danger"]).optional(),
        }),
      )
      .optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    channels: z
      .array(z.enum(["in-app", "email", "sms", "push"]))
      .default(["in-app"]),
    expiresAt: z.string().optional(),
    groupId: z.string().optional(),
  })
  .refine((data) => data.sellerId || data.userId, {
    message: "Either sellerId or userId is required",
    path: ["userId"],
  });

// Update notification schema
export const UpdateNotificationSchema = z
  .object({
    id: z.string().optional(),
    markAll: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    dismissRead: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    action: z.enum(["read", "dismiss"]).default("read"),
  })
  .refine((data) => data.id || data.markAll || data.dismissRead, {
    message:
      "Either notification ID, markAll, or dismissRead parameter is required",
    path: ["id"],
  });

// Type exports
export type GetNotificationsRequest = z.infer<typeof GetNotificationsSchema>;
export type CreateNotificationRequest = z.infer<
  typeof CreateNotificationSchema
>;
export type UpdateNotificationRequest = z.infer<
  typeof UpdateNotificationSchema
>;
