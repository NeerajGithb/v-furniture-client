import { NextRequest } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { addressService } from "@/lib/domain/address/AddressService";
import { UpdateAddressSchema } from "@/lib/domain/address/AddressSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const GET = withAuth(
  withDB(
    withRouteErrorHandling(
      async (
        _request: NextRequest,
        user: AuthenticatedUser,
        { params }: { params: Promise<{ id: string }> },
      ) => {
        const { id: addressId } = await params;

        if (!addressId) {
          return ApiResponseBuilder.error("Address ID is required", 400);
        }

        const result = await addressService.getAddressById(
          user.userId,
          addressId,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);

export const PUT = withAuth(
  withDB(
    withRouteErrorHandling(
      async (
        request: NextRequest,
        user: AuthenticatedUser,
        { params }: { params: Promise<{ id: string }> },
      ) => {
        const { id: addressId } = await params;
        const body = await request.json();

        if (!addressId) {
          return ApiResponseBuilder.error("Address ID is required", 400);
        }

        // Validate at route boundary with Zod
        const validatedData = UpdateAddressSchema.parse(body);

        const result = await addressService.updateAddress(
          user.userId,
          addressId,
          validatedData,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);

export const DELETE = withAuth(
  withDB(
    withRouteErrorHandling(
      async (
        _request: NextRequest,
        user: AuthenticatedUser,
        { params }: { params: Promise<{ id: string }> },
      ) => {
        const { id: addressId } = await params;

        if (!addressId) {
          return ApiResponseBuilder.error("Address ID is required", 400);
        }

        const result = await addressService.deleteAddress(
          user.userId,
          addressId,
        );
        return ApiResponseBuilder.success(result);
      },
    ),
  ),
);
