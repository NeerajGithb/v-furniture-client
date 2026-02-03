import { BasePrivateService } from "./baseService";
import { Address, AddressForm } from "@/types/address";

/**
 * Frontend Address Service
 * Handles all address-related HTTP operations (requires authentication)
 */
class AddressService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get all user addresses
  async getAddresses(): Promise<Address[]> {
    const response = await this.get<{ addresses: Address[] }>(
      "/address?legacy=true",
    );
    return response.data?.addresses || [];
  }

  // Add new address
  async addAddress(addressData: AddressForm): Promise<Address> {
    const payload = {
      ...addressData,
      country: addressData.country || "India",
      fullName: addressData.fullName.trim(),
      phone: addressData.phone.replace(/\s+/g, ""),
      addressLine1: addressData.addressLine1.trim(),
      addressLine2: addressData.addressLine2?.trim() || "",
      city: addressData.city.trim(),
      state: addressData.state.trim(),
      postalCode: addressData.postalCode.trim(),
    };

    const response = await this.post<{
      success: boolean;
      message: string;
      data: Address;
    }>("/address", payload);
    // API wraps the service response, so response.data contains the service response
    return response.data?.data!;
  }

  // Update existing address
  async updateAddress(
    id: string,
    updates: Partial<AddressForm>,
  ): Promise<Address> {
    const cleanUpdates = { ...updates };

    // Clean and validate phone
    if (cleanUpdates.phone) {
      cleanUpdates.phone = cleanUpdates.phone.replace(/\s+/g, "");
    }

    // Clean postal code
    if (cleanUpdates.postalCode) {
      cleanUpdates.postalCode = cleanUpdates.postalCode.trim();
    }

    // Clean string fields
    (Object.keys(cleanUpdates) as (keyof AddressForm)[]).forEach((key) => {
      if (typeof cleanUpdates[key] === "string") {
        const trimmed = (cleanUpdates[key] as string).trim();
        if (trimmed.length > 0) {
          cleanUpdates[key] = trimmed as any;
        } else if (key === "addressLine2") {
          cleanUpdates[key] = undefined;
        }
      }
    });

    const response = await this.put<{
      success: boolean;
      message: string;
      data: Address;
    }>(`/address/${id}`, cleanUpdates);
    // API wraps the service response, so response.data contains the service response
    return response.data?.data!;
  }

  // Delete address by ID
  async deleteAddress(id: string): Promise<void> {
    await this.delete(`/address/${id}`);
  }

  // Set address as default
  async setDefaultAddress(id: string): Promise<Address> {
    return this.updateAddress(id, { isDefault: true });
  }
}

// Export singleton instance
export const addressService = new AddressService();
