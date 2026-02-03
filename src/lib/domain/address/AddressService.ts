import { IAddressRepository, PaginatedResult } from "./IAddressRepository";
import { AddressRepository } from "./AddressRepository";
import { CreateAddressRequest, UpdateAddressRequest } from "./AddressSchemas";
import { AddressDuplicateError, AddressNotFoundError } from "./AddressErrors";
import {
  Address as AddressType,
  AddressesResponse,
  CreateAddressResponse,
  UpdateAddressResponse,
  DeleteAddressResponse,
} from "@/types/address";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  CACHE_TTL,
} from "@/lib/cache";

export class AddressService {
  constructor(
    private repository: IAddressRepository = new AddressRepository(),
  ) {}
  // Retrieve paginated addresses for a user with caching
  async getUserAddresses(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<AddressType>> {
    const cacheKey = `addresses:user:${userId}:p${page}_l${limit}`;

    const cached = await getCached<PaginatedResult<AddressType>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.repository.findByUserId(userId, { page, limit });
    await setCache(cacheKey, result, CACHE_TTL.ADDRESSES);
    return result;
  }

  // Get all addresses for backward compatibility
  async getUserAddressesLegacy(userId: string): Promise<AddressesResponse> {
    const result = await this.getUserAddresses(userId, 1, 100);

    return {
      addresses: result.items,
    };
  }

  // Create new address with business logic
  async createAddress(
    userId: string,
    addressData: CreateAddressRequest,
  ): Promise<CreateAddressResponse> {
    const existingAddress = await this.repository.findDuplicate(
      userId,
      addressData,
    );
    if (existingAddress) {
      throw new AddressDuplicateError("Address already exists");
    }

    const newAddress = await this.repository.create(userId, addressData);
    await invalidateCacheByPrefix(`addresses:user:${userId}`);

    return {
      success: true,
      message: "Address added successfully",
      data: newAddress,
    };
  }

  // Update existing address with business logic
  async updateAddress(
    userId: string,
    addressId: string,
    updateData: UpdateAddressRequest,
  ): Promise<UpdateAddressResponse> {
    if (this.hasKeyFieldUpdates(updateData)) {
      const duplicateData = this.buildDuplicateCheckData(updateData);
      if (duplicateData) {
        const existingAddress = await this.repository.findDuplicate(
          userId,
          duplicateData,
          addressId,
        );
        if (existingAddress) {
          throw new AddressDuplicateError("Address already exists");
        }
      }
    }

    const updatedAddress = await this.repository.update(
      addressId,
      userId,
      updateData,
    );

    if (!updatedAddress) {
      throw new AddressNotFoundError(addressId);
    }

    await Promise.all([
      invalidateCacheByPrefix(`addresses:user:${userId}`),
      invalidateCacheByPrefix(`address:${addressId}`),
    ]);

    return {
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    };
  }

  // Delete address with cache invalidation
  async deleteAddress(
    userId: string,
    addressId: string,
  ): Promise<DeleteAddressResponse> {
    const deleted = await this.repository.delete(addressId, userId);

    if (!deleted) {
      throw new AddressNotFoundError(addressId);
    }

    await Promise.all([
      invalidateCacheByPrefix(`addresses:user:${userId}`),
      invalidateCacheByPrefix(`address:${addressId}`),
    ]);

    return {
      success: true,
      message: "Address deleted successfully",
    };
  }

  // Retrieve specific address by ID with ownership verification
  async getAddressById(
    userId: string,
    addressId: string,
  ): Promise<AddressType> {
    const cacheKey = `address:${addressId}:user:${userId}`;

    const cached = await getCached<AddressType>(cacheKey);
    if (cached) {
      return cached;
    }

    const address = await this.repository.findByIdAndUserId(addressId, userId);

    if (!address) {
      throw new AddressNotFoundError(addressId);
    }

    await setCache(cacheKey, address, CACHE_TTL.ADDRESSES);
    return address;
  }

  // Get user's default address
  async getDefaultAddress(userId: string): Promise<AddressType | null> {
    const result = await this.getUserAddresses(userId, 1, 1);
    const defaultAddress = result.items.find((addr) => addr.isDefault);
    return defaultAddress || null;
  }

  // Set specific address as default
  async setDefaultAddress(
    userId: string,
    addressId: string,
  ): Promise<UpdateAddressResponse> {
    return this.updateAddress(userId, addressId, { isDefault: true });
  }

  // Get total address count for user
  async getAddressCount(userId: string): Promise<number> {
    const cacheKey = `addresses:count:user:${userId}`;

    const cached = await getCached<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const count = await this.repository.countByUserId(userId);
    await setCache(cacheKey, count, CACHE_TTL.ADDRESSES);
    return count;
  }

  // Check if update contains key fields that require duplicate checking
  private hasKeyFieldUpdates(updateData: any): boolean {
    const keyFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
    ];
    return keyFields.some((field) => updateData[field] !== undefined);
  }

  // Build data object for duplicate checking from update request
  private buildDuplicateCheckData(updateData: any): any | null {
    const requiredFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
    ];
    const hasAllFields = requiredFields.every(
      (field) => updateData[field] !== undefined,
    );

    if (!hasAllFields) {
      return null;
    }

    return {
      fullName: updateData.fullName,
      phone: updateData.phone,
      addressLine1: updateData.addressLine1,
      addressLine2: updateData.addressLine2,
      city: updateData.city,
      state: updateData.state,
      postalCode: updateData.postalCode,
      country: updateData.country,
      type: updateData.type,
      isDefault: updateData.isDefault,
    };
  }
}

// Create default instance for backward compatibility
export const addressService = new AddressService();
