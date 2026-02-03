import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { webhookService } from "@/lib/domain/webhooks/WebhookService";
import { RazorpayWebhookSchema } from "@/lib/domain/webhooks/WebhookSchemas";
import { DuplicateWebhookEventError } from "@/lib/domain/webhooks/WebhookErrors";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const POST = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    // Get signature and raw body
    const signature = request.headers.get("x-razorpay-signature");
    const rawBody = await request.text();

    // Verify signature at route boundary
    webhookService.verifySignature({
      signature: signature || "",
      rawBody,
    });

    // Parse and validate payload at route boundary
    const payload = JSON.parse(rawBody);
    const validatedPayload = RazorpayWebhookSchema.parse(payload);

    try {
      // Service handles all business logic
      const result =
        await webhookService.processRazorpayWebhook(validatedPayload);
      return ApiResponseBuilder.success(result);
    } catch (error) {
      // Handle duplicate events gracefully
      if (error instanceof DuplicateWebhookEventError) {
        return ApiResponseBuilder.success({
          received: true,
          duplicate: true,
          message: "Duplicate event, skipping processing",
        });
      }

      // Re-throw other errors to be handled by withRouteErrorHandling middleware
      throw error;
    }
  }),
);
