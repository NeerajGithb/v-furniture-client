import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { notificationsService } from "@/lib/domain/notifications/NotificationsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import {
  GetNotificationsSchema,
  CreateNotificationSchema,
  UpdateNotificationSchema,
} from "@/lib/domain/notifications/NotificationsSchemas";

// GET - Fetch notifications
export const GET = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const { searchParams } = new URL(request.url);

        // Convert searchParams to object for Zod validation
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        // Validate query parameters at route boundary
        const validatedQuery = GetNotificationsSchema.parse(queryParams);

        const result = await notificationsService.getUserNotifications(
          user.userId,
          validatedQuery,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);

// POST - Create notification
export const POST = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const body = await request.json();

        // Validate body at route boundary
        const validatedData = CreateNotificationSchema.parse(body);

        const result =
          await notificationsService.createNotification(validatedData);
        return ApiResponseBuilder.success(result, 201);
      },
    ),
  ),
);

// PATCH - Update notification (mark as read/dismiss)
export const PATCH = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const { searchParams } = new URL(request.url);

        // Convert searchParams to object for Zod validation
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        // Validate query parameters at route boundary
        const validatedData = UpdateNotificationSchema.parse(queryParams);

        const result = await notificationsService.updateNotification(
          user.userId,
          validatedData,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
