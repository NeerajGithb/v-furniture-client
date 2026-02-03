import { Address } from "./address";

// Profile page component props
export interface ProfilePageData {
  user: any;
  isLoading: boolean;
  error: Error | null;
  editing: boolean;
  uploadingImage: boolean;
  form: {
    name: string;
    phone: string;
  };
}

export interface ProfileFormProps {
  user: any;
  loading: boolean;
  error: string | null;
  editing: boolean;
  uploadingImage: boolean;
  uploadProgress?: number;
  form: {
    name: string;
    phone: string;
  };
  onSave: (formData: { name: string; phone: string }) => Promise<void>;
  onImageUpload: (file: File) => Promise<void>;
  onEdit: () => void;
  onCancel: () => void;
  onFormUpdate: (updates: Partial<{ name: string; phone: string }>) => void;
  clearError: () => void;
}

// Address page component props
export interface AddressPageData {
  addresses: Address[];
  isLoading: boolean;
  error: Error | null;
  showAddressForm: boolean;
  addressForm: any;
  editingAddressId: string | null;
}

export interface AddressListProps {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
  onAddNew: () => void;
}

export interface AddressFormProps {
  show: boolean;
  form: any;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  onFormUpdate: (updates: any) => void;
}
