import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { addressService } from "@/services/addressService";
import { Address, AddressForm } from "@/types/address";

// Query hook - fetch all addresses
export const useAddresses = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressService.getAddresses(),
    enabled: enabled,
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
    mutationFn: (
      addressData: Omit<AddressForm, "country"> & { country?: string },
    ) =>
      addressService.addAddress({
        ...addressData,
        country: addressData.country || "India",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add address");
    },
  });
};

// Mutation hook - update address
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<AddressForm>;
    }) => addressService.updateAddress(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update address");
    },
  });
};

// Mutation hook - delete address
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete address");
    },
  });
};

// Mutation hook - set default address
export const useSetDefaultAddress = () => {
  const updateMutation = useUpdateAddress();
  return useMutation({
    mutationFn: (id: string) =>
      updateMutation.mutateAsync({ id, updates: { isDefault: true } }),
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
