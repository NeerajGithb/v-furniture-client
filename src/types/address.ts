export type AddressType = "home" | "work" | "other";

export interface Address {
  _id: string;
  type?: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressForm {
  type?: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface AddressesResponse {
  addresses: Address[];
}

export interface CreateAddressResponse {
  success: boolean;
  message: string;
  data: Address;
}

export interface UpdateAddressResponse {
  success: boolean;
  message: string;
  data: Address;
}

export interface DeleteAddressResponse {
  success: boolean;
  message: string;
}
