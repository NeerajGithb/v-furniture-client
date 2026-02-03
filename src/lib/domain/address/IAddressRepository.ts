import { Address as AddressType } from "@/types/address";
import { CreateAddressRequest, UpdateAddressRequest } from "./AddressSchemas";

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Repository interface for dependency injection
export interface IAddressRepository {
  findById(addressId: string): Promise<AddressType>;
  findByIdAndUserId(addressId: string, userId: string): Promise<AddressType>;
  findByUserId(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<AddressType>>;
  findDuplicate(
    userId: string,
    addressData: CreateAddressRequest,
    excludeId?: string,
  ): Promise<AddressType | null>;
  create(
    userId: string,
    addressData: CreateAddressRequest,
  ): Promise<AddressType>;
  update(
    addressId: string,
    userId: string,
    updateData: UpdateAddressRequest,
  ): Promise<AddressType>;
  delete(addressId: string, userId: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
}
