import { memo, useCallback } from 'react';
import { Check, Edit2 } from 'lucide-react';

interface AddressCardProps {
    address: any;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onEdit: (id: string) => void;
}

export const AddressCard = memo<AddressCardProps>(({ address, isSelected, onSelect, onEdit }) => {
    const handleSelect = useCallback(() => {
        onSelect(address._id);
    }, [address._id, onSelect]);

    const handleEdit = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onEdit(address._id);
        },
        [address._id, onEdit],
    );

    return (
        <div
            className={`p-3 sm:p-4 border-2 cursor-pointer transition-all rounded-xs ${isSelected ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
        >
            <div className="flex items-start justify-between">
                <div onClick={handleSelect} className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{address.fullName}</span>
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded-xs capitalize">
                            {address.type}
                        </span>
                        {address.isDefault && (
                            <span className="text-xs bg-blue-600 dark:bg-blue-700 text-white px-1.5 py-0.5 rounded-xs">
                                Default
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mb-1">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mb-1">
                        {address.city}, {address.state} - {address.postalCode}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">Phone: {address.phone}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    <button
                        onClick={handleEdit}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors rounded-xs"
                        title="Edit address"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
});

AddressCard.displayName = 'AddressCard';