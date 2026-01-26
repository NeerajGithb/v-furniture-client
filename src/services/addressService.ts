import Address from "@/models/Address";

/**
 * Address Business Logic Service
 * Extracted from Address model
 */

export async function getDefaultAddress(userId: string): Promise<any> {
  return Address.findOne({ userId, isDefault: true });
}

export async function getUserAddresses(userId: string): Promise<any[]> {
  return Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
}

export async function setAddressAsDefault(address: any): Promise<any> {
  // Unset all other addresses as default
  await Address.updateMany(
    { userId: address.userId, _id: { $ne: address._id } },
    { isDefault: false }
  );

  address.isDefault = true;
  return address.save();
}

export async function ensureSingleDefault(
  userId: string,
  currentAddressId: string
): Promise<void> {
  // This is called when an address is being set as default
  await Address.updateMany(
    { userId, _id: { $ne: currentAddressId } },
    { isDefault: false }
  );
}