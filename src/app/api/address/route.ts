import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { addressService } from "@/lib/domain/address/AddressService";
import {
  CreateAddressSchema,
  PaginationSchema,
} from "@/lib/domain/address/AddressSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const GET = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page");
        const limit = searchParams.get("limit");
        const legacy = searchParams.get("legacy") === "true";

        if (legacy) {
          const result = await addressService.getUserAddressesLegacy(
            user.userId,
          );
          return ApiResponseBuilder.success(result);
        }

        // Parse pagination with Zod
        const pagination = PaginationSchema.parse({ page, limit });

        const result = await addressService.getUserAddresses(
          user.userId,
          pagination.page,
          pagination.limit,
        );
        return ApiResponseBuilder.paginated(result.items, result.pagination);
      },
    ),
  ),
);

export const POST = withAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, user: AuthenticatedUser) => {
        const body = await request.json();

        // Validate at route boundary with Zod
        const validatedData = CreateAddressSchema.parse(body);

        const result = await addressService.createAddress(
          user.userId,
          validatedData,
        );
        return ApiResponseBuilder.success(result, 201);
      },
    ),
  ),
);
