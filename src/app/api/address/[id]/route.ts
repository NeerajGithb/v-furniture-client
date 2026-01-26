import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import Address from "@/models/Address";
import { connectDB } from "@/lib/dbConnect";
import { invalidateCacheByPrefix } from "@/lib/cache";

/**
 * UPDATE ADDRESS
 */
export const PUT = withAuth(
  async (
    request: NextRequest,
    user: AuthenticatedUser,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id: addressId } = await params;
      const body = await request.json();

      if (!addressId) {
        return NextResponse.json(
          { error: "Address ID is required" },
          { status: 400 },
        );
      }

      await connectDB();

      const address = await Address.findOne({
        _id: addressId,
        userId: user.userId,
      });

      if (!address) {
        return NextResponse.json(
          { error: "Address not found" },
          { status: 404 },
        );
      }

      // Handle default address logic
      if (body.isDefault) {
        await Address.updateMany(
          { userId: user.userId, _id: { $ne: addressId } },
          { isDefault: false },
        );
      }

      const updateFields = {
        ...(body.type && { type: body.type }),
        ...(body.fullName && { fullName: body.fullName.trim() }),
        ...(body.phone && { phone: body.phone.trim() }),
        ...(body.addressLine1 && { addressLine1: body.addressLine1.trim() }),
        ...(body.addressLine2 !== undefined && {
          addressLine2: body.addressLine2?.trim() || "",
        }),
        ...(body.city && { city: body.city.trim() }),
        ...(body.state && { state: body.state.trim() }),
        ...(body.postalCode && { postalCode: body.postalCode.trim() }),
        ...(body.country && { country: body.country }),
        ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
      };

      const updatedAddress = await Address.findByIdAndUpdate(
        addressId,
        updateFields,
        { new: true, runValidators: true },
      );

      // ✅ INVALIDATE ADDRESS CACHES
      await invalidateCacheByPrefix(`addresses:user:${user.userId}`);
      await invalidateCacheByPrefix(`address:${addressId}`);

      return NextResponse.json({
        message: "Address updated successfully",
        address: {
          _id: updatedAddress._id,
          type: updatedAddress.type,
          fullName: updatedAddress.fullName,
          phone: updatedAddress.phone,
          addressLine1: updatedAddress.addressLine1,
          addressLine2: updatedAddress.addressLine2,
          city: updatedAddress.city,
          state: updatedAddress.state,
          postalCode: updatedAddress.postalCode,
          country: updatedAddress.country,
          isDefault: updatedAddress.isDefault,
        },
      });
    } catch (error) {
      console.error("Address PUT error:", error);
      return NextResponse.json(
        { error: "Failed to update address" },
        { status: 500 },
      );
    }
  },
);

/**
 * DELETE ADDRESS
 */
export const DELETE = withAuth(
  async (
    request: NextRequest,
    user: AuthenticatedUser,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id: addressId } = await params;

      if (!addressId) {
        return NextResponse.json(
          { error: "Address ID is required" },
          { status: 400 },
        );
      }

      await connectDB();

      const address = await Address.findOne({
        _id: addressId,
        userId: user.userId,
      });

      if (!address) {
        return NextResponse.json(
          { error: "Address not found" },
          { status: 404 },
        );
      }

      const wasDefault = address.isDefault;

      await Address.findByIdAndDelete(addressId);

      if (wasDefault) {
        const nextAddress = await Address.findOne({
          userId: user.userId,
        }).sort({ createdAt: -1 });

        if (nextAddress) {
          nextAddress.isDefault = true;
          await nextAddress.save();
        }
      }

      // ✅ INVALIDATE ADDRESS CACHES
      await invalidateCacheByPrefix(`addresses:user:${user.userId}`);
      await invalidateCacheByPrefix(`address:${addressId}`);

      return NextResponse.json({
        message: "Address deleted successfully",
      });
    } catch (error) {
      console.error("Address DELETE error:", error);
      return NextResponse.json(
        { error: "Failed to delete address" },
        { status: 500 },
      );
    }
  },
);