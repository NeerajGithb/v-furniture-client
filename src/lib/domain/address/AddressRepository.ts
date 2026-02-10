import Address from "@/models/Address";
import { Address as AddressType } from "@/types/address";
import { CreateAddressRequest, UpdateAddressRequest } from "./AddressSchemas";
import {
  IAddressRepository,
  PaginationOptions,
  PaginatedResult,
} from "./IAddressRepository";
import { AddressNotFoundError } from "./AddressErrors";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import { withTransaction } from "@/lib/utils/transaction";
import mongoose from "mongoose";

export class AddressRepository implements IAddressRepository {
  // Find address by ID only
  async findById(addressId: string): Promise<AddressType> {
    const address = await Address.findById(addressId).lean();
    if (!address) {
      throw new AddressNotFoundError(addressId);
    }
    return this.mapToAddressType(address);
  }

  // Find address by ID with user ownership verification
  async findByIdAndUserId(
    addressId: string,
    userId: string,
  ): Promise<AddressType> {
    const address = await Address.findOne({
      _id: addressId,
      userId,
    }).lean();

    if (!address) {
      throw new AddressNotFoundError(addressId);
    }

    return this.mapToAddressType(address);
  }

  // Find all addresses for user with pagination and sorting
  async findByUserId(
    userId: string,
    options: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<AddressType>> {
    const { page, limit, sortBy = "createdAt", sortOrder = "desc" } = options;
    const skip = (page - 1) * limit;

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "fullName",
      "city",
      "state",
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;

    const sortOptions: Record<string, 1 | -1> = {
      isDefault: -1,
      [safeSortBy]: safeSortOrder,
    };

    const [addresses, total] = await Promise.all([
      Address.find({ userId })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Address.countDocuments({ userId }),
    ]);

    const items = safeMapList(
      addresses,
      this.mapToAddressType.bind(this),
      "address",
    );
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Check for duplicate address based on key fields
  async findDuplicate(
    userId: string,
    addressData: CreateAddressRequest,
    excludeId?: string,
  ): Promise<AddressType | null> {
    const query: mongoose.FilterQuery<typeof Address> = {
      userId,
      fullName: addressData.fullName.trim(),
      phone: addressData.phone.trim(),
      addressLine1: addressData.addressLine1.trim(),
      city: addressData.city.trim(),
      state: addressData.state.trim(),
      postalCode: addressData.postalCode.trim(),
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const address = await Address.findOne(query).lean();
    return address ? this.mapToAddressType(address) : null;
  }

  // Create new address with atomic default handling
  async create(
    userId: string,
    addressData: CreateAddressRequest,
  ): Promise<AddressType> {
    return await withTransaction(async (session) => {
      const existingCount = await Address.countDocuments({ userId }).session(
        session,
      );
      const shouldBeDefault = existingCount === 0 || addressData.isDefault;

      if (shouldBeDefault) {
        await Address.updateMany(
          { userId },
          { isDefault: false },
          { session },
        );
      }

      const address = new Address({
        userId,
        type: addressData.type || "home",
        fullName: addressData.fullName.trim(),
        phone: addressData.phone.trim(),
        addressLine1: addressData.addressLine1.trim(),
        addressLine2: addressData.addressLine2?.trim() || "",
        city: addressData.city.trim(),
        state: addressData.state.trim(),
        postalCode: addressData.postalCode.trim(),
        country: addressData.country || "India",
        isDefault: shouldBeDefault,
      });

      await address.save({ session });
      return this.mapToAddressType(address.toObject());
    });
  }

  // Update existing address with atomic default handling
  async update(
    addressId: string,
    userId: string,
    updateData: UpdateAddressRequest,
  ): Promise<AddressType> {
    return await withTransaction(async (session) => {
      const existingAddress = await Address.findOne({
        _id: addressId,
        userId,
      }).session(session);

      if (!existingAddress) {
        throw new AddressNotFoundError(addressId);
      }

      if (updateData.isDefault) {
        await Address.updateMany(
          { userId, _id: { $ne: addressId } },
          { isDefault: false },
          { session },
        );
      }

      const updateFields: Partial<CreateAddressRequest> = {};
      if (updateData.type) updateFields.type = updateData.type;
      if (updateData.fullName)
        updateFields.fullName = updateData.fullName.trim();
      if (updateData.phone) updateFields.phone = updateData.phone.trim();
      if (updateData.addressLine1)
        updateFields.addressLine1 = updateData.addressLine1.trim();
      if (updateData.addressLine2 !== undefined) {
        updateFields.addressLine2 = updateData.addressLine2?.trim() || "";
      }
      if (updateData.city) updateFields.city = updateData.city.trim();
      if (updateData.state) updateFields.state = updateData.state.trim();
      if (updateData.postalCode)
        updateFields.postalCode = updateData.postalCode.trim();
      if (updateData.country) updateFields.country = updateData.country;
      if (updateData.isDefault !== undefined)
        updateFields.isDefault = updateData.isDefault;

      const updatedAddress = await Address.findByIdAndUpdate(
        addressId,
        updateFields,
        { new: true, runValidators: true, session },
      );

      if (!updatedAddress) {
        throw new AddressNotFoundError(addressId);
      }

      return this.mapToAddressType(updatedAddress.toObject());
    });
  }

  // Delete address with atomic default reassignment
  async delete(addressId: string, userId: string): Promise<boolean> {
    return await withTransaction(async (session) => {
      const address = await Address.findOne({
        _id: addressId,
        userId,
      }).session(session);

      if (!address) {
        throw new AddressNotFoundError(addressId);
      }

      const wasDefault = address.isDefault;

      await Address.findByIdAndDelete(addressId, { session });

      if (wasDefault) {
        const nextAddress = await Address.findOne({ userId })
          .sort({ createdAt: -1 })
          .session(session);

        if (nextAddress) {
          nextAddress.isDefault = true;
          await nextAddress.save({ session });
        }
      }

      return true;
    });
  }

  // Count total addresses for user
  async countByUserId(userId: string): Promise<number> {
    return await Address.countDocuments({ userId });
  }

  // Map database document to domain type
  private mapToAddressType(db: any): AddressType {
    validateRequiredFields(
      db,
      [
        "_id",
        "fullName",
        "phone",
        "addressLine1",
        "city",
        "state",
        "postalCode",
        "country",
      ],
      "address",
    );

    return {
      _id: db._id.toString(),
      type: db.type || "home",
      fullName: db.fullName,
      phone: db.phone,
      addressLine1: db.addressLine1,
      addressLine2: db.addressLine2 || "",
      city: db.city,
      state: db.state,
      postalCode: db.postalCode,
      country: db.country || "India",
      isDefault: db.isDefault || false,
      createdAt: db.createdAt,
    };
  }
}
