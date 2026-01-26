import { create } from "zustand";

export type AddressType = "home" | "work" | "other";

export interface Address {
  _id: string;
  type: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface AddressForm {
  type: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const initialAddressForm: AddressForm = {
  type: "home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

interface AddressStore {
  selectedAddressId: string;
  showAddressForm: boolean;
  addressForm: AddressForm;
  editingAddressId: string | null;

  setSelectedAddress: (id: string) => void;
  setShowAddressForm: (show: boolean) => void;
  updateAddressForm: (updates: Partial<AddressForm>) => void;
  resetAddressForm: () => void;
  setEditingAddress: (id: string | null, address?: Address) => void;
}

export const useAddressStore = create<AddressStore>((set) => ({
  selectedAddressId: "",
  showAddressForm: false,
  addressForm: { ...initialAddressForm },
  editingAddressId: null,

  setSelectedAddress: (id: string) => {
    set({ selectedAddressId: id });
  },

  setShowAddressForm: (show: boolean) => {
    set({ showAddressForm: show });
  },

  updateAddressForm: (updates: Partial<AddressForm>) => {
    set((state) => ({
      addressForm: { ...state.addressForm, ...updates },
    }));
  },

  resetAddressForm: () => {
    set({
      addressForm: { ...initialAddressForm },
      editingAddressId: null,
    });
  },

  setEditingAddress: (id: string | null, address?: Address) => {
    if (id && address) {
      set({
        editingAddressId: id,
        addressForm: {
          ...address,
          addressLine2: address.addressLine2 || "",
        },
        showAddressForm: true,
      });
    } else {
      set({ editingAddressId: null });
    }
  },
}));