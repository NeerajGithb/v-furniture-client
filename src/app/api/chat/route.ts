import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { chatService } from "@/lib/domain/chat/ChatService";
import { ChatMessageSchema } from "@/lib/domain/chat/ChatSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { authenticateUser } from "@/lib/middleware/auth";

export const POST = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const body = await request.json();

    // Validate request body at route boundary
    const validatedData = ChatMessageSchema.parse(body);

    // Check authentication (lazy - only when needed)
    let authUser: any = null;
    try {
      const authResult = await authenticateUser(request);
      authUser = authResult.user;
    } catch (error) {
      // Authentication failed, but we'll handle this in the service
      authUser = null;
    }

    // Service handles all business logic
    const result = await chatService.processMessage(validatedData, authUser);

    return ApiResponseBuilder.success(result);
  }),
);
