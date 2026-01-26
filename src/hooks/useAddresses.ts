import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWithCredentials,
  handleApiResponse,
} from "@/utils/fetchWithCredentials";
import { toast } from "react-hot-toast";
import { Address, AddressForm } from "@/stores/addressStore";
import { useAuthStore } from "@/stores/authStore";

// Validation utilities
const validatePhone = (phone: string): boolean =>
  /^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ""));

const validatePostalCode = (postalCode: string): boolean =>
  /^[1-9][0-9]{5}$/.test(postalCode.trim());

const validateName = (name: string): boolean =>
  /^[a-zA-Z\s]{2,50}$/.test(name.trim());

export const isValidAddressForm = (form: AddressForm): boolean => {
  const requiredFields = [
    form.fullName?.trim(),
    form.phone?.trim(),
    form.addressLine1?.trim(),
    form.city?.trim(),
    form.state?.trim(),
    form.postalCode?.trim(),
  ];

  const hasAllRequiredFields = requiredFields.every(
    (field) => field && field.length > 0,
  );
  if (!hasAllRequiredFields) return false;

  return (
    validatePhone(form.phone) &&
    validatePostalCode(form.postalCode) &&
    validateName(form.fullName) &&
    form.addressLine1.trim().length >= 10 &&
    validateName(form.city) &&
    validateName(form.state)
  );
};

// Query hook - fetch all addresses
export const useAddresses = () => {
  const { isAuthenticated, authLoading } = useAuthStore();

  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await fetchWithCredentials("/api/address");

      if (!response.ok) {
        if (response.status === 401) {
          return [];
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await handleApiResponse(response);

      if (!data || !Array.isArray(data.addresses)) {
        console.warn("Invalid address data structure:", data);
        return [];
      }

      return data.addresses as Address[];
    },
    enabled: !authLoading && isAuthenticated, // 🔥 Wait for auth to load, then check if authenticated
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Mutation hook - add address
export const useAddAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      addressData: Omit<AddressForm, "country"> & { country?: string },
    ) => {
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

      if (!validatePhone(payload.phone)) {
        throw new Error("Please enter a valid 10-digit phone number");
      }
      if (!validatePostalCode(payload.postalCode)) {
        throw new Error("Please enter a valid 6-digit PIN code");
      }
      if (!validateName(payload.fullName)) {
        throw new Error("Please enter a valid full name");
      }

      const response = await fetchWithCredentials("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await handleApiResponse(response);

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP Error: ${response.status}`);
      }

      if (!responseData.address || !responseData.address._id) {
        throw new Error("Invalid response: missing address data");
      }

      return responseData.address as Address;
    },
    onMutate: async (newAddress) => {
      await queryClient.cancelQueries({ queryKey: ["addresses"] });
      const previousAddresses = queryClient.getQueryData<Address[]>([
        "addresses",
      ]);

      const tempId = `temp-${Date.now()}`;
      const optimisticAddress: Address = {
        _id: tempId,
        ...newAddress,
        country: newAddress.country || "India",
        phone: newAddress.phone.replace(/\s+/g, ""),
        addressLine2: newAddress.addressLine2 || undefined,
      } as Address;

      queryClient.setQueryData<Address[]>(["addresses"], (old) => [
        ...(old || []),
        optimisticAddress,
      ]);

      return { previousAddresses, tempId };
    },
    onError: (err, newAddress, context) => {
      queryClient.setQueryData(["addresses"], context?.previousAddresses);
      toast.error(err instanceof Error ? err.message : "Failed to add address");
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<Address[]>(["addresses"], (old) =>
        (old || []).map((addr) => (addr._id === context?.tempId ? data : addr)),
      );
      toast.success("Address added successfully");
    },
  });
};

// Mutation hook - update address
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<AddressForm>;
    }) => {
      const cleanUpdates = { ...updates };

      if (cleanUpdates.phone) {
        cleanUpdates.phone = cleanUpdates.phone.replace(/\s+/g, "");
        if (!validatePhone(cleanUpdates.phone)) {
          throw new Error("Please enter a valid 10-digit phone number");
        }
      }

      if (cleanUpdates.postalCode) {
        cleanUpdates.postalCode = cleanUpdates.postalCode.trim();
        if (!validatePostalCode(cleanUpdates.postalCode)) {
          throw new Error("Please enter a valid 6-digit PIN code");
        }
      }

      if (
        cleanUpdates.fullName &&
        !validateName(cleanUpdates.fullName.trim())
      ) {
        throw new Error("Please enter a valid full name");
      }

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

      const response = await fetchWithCredentials(`/api/address/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanUpdates),
      });

      const responseData = await handleApiResponse(response);

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP Error: ${response.status}`);
      }

      if (!responseData.address) {
        throw new Error("Invalid response: missing address data");
      }

      return responseData.address as Address;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["addresses"] });
      const previousAddresses = queryClient.getQueryData<Address[]>([
        "addresses",
      ]);
      const currentAddress = previousAddresses?.find((addr) => addr._id === id);

      if (currentAddress) {
        const optimisticAddress = { ...currentAddress, ...updates };
        queryClient.setQueryData<Address[]>(["addresses"], (old) =>
          (old || []).map((addr) =>
            addr._id === id ? optimisticAddress : addr,
          ),
        );
      }

      return { previousAddresses };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["addresses"], context?.previousAddresses);
      toast.error(
        err instanceof Error ? err.message : "Failed to update address",
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Address[]>(["addresses"], (old) =>
        (old || []).map((addr) => (addr._id === data._id ? data : addr)),
      );
      toast.success("Address updated successfully");
    },
  });
};

// Mutation hook - delete address
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithCredentials(`/api/address/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await handleApiResponse(response).catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["addresses"] });
      const previousAddresses = queryClient.getQueryData<Address[]>([
        "addresses",
      ]);

      queryClient.setQueryData<Address[]>(["addresses"], (old) =>
        (old || []).filter((addr) => addr._id !== id),
      );

      return { previousAddresses };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["addresses"], context?.previousAddresses);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete address",
      );
    },
    onSuccess: () => {
      toast.success("Address deleted successfully");
    },
  });
};

// Mutation hook - set default address
export const useSetDefaultAddress = () => {
  const updateMutation = useUpdateAddress();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateMutation.mutateAsync({ id, updates: { isDefault: true } });
    },
  });
};

// Utility hooks
export const useSelectedAddress = (selectedId: string) => {
  const { data: addresses = [] } = useAddresses();
  return addresses.find((a) => a._id === selectedId) || null;
};

export const useDefaultAddress = () => {
  const { data: addresses = [] } = useAddresses();
  return addresses.find((a) => a.isDefault) || null;
};

export const useAddressById = (id: string) => {
  const { data: addresses = [] } = useAddresses();
  return addresses.find((a) => a._id === id) || null;
};