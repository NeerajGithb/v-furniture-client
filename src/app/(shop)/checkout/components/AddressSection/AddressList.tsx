import { Plus } from "lucide-react";
import { AddressCard } from "./AddressCard";

interface AddressListProps {
  addresses: any[];
  selectedAddressId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onAddNew: () => void;
}

export const AddressList = ({
  addresses,
  selectedAddressId,
  onSelect,
  onEdit,
  onAddNew,
}: AddressListProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {addresses.map((addr) => (
          <AddressCard
            key={addr._id}
            address={addr}
            isSelected={selectedAddressId === addr._id}
            onSelect={onSelect}
            onEdit={onEdit}
          />
        ))}
      </div>

      <button
        onClick={onAddNew}
        className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-xs flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add New Address
      </button>
    </div>
  );
};
