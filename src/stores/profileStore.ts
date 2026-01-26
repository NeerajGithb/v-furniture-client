import { create } from "zustand";

export interface User {
  id: string;
  _id?: string; // MongoDB ID compatibility
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  createdAt: string;
}

export interface ProfileFormData {
  name: string;
  phone: string;
}

interface ProfileState {
  editing: boolean;
  uploadingImage: boolean;
  form: ProfileFormData;

  setEditing: (editing: boolean) => void;
  setUploadingImage: (uploading: boolean) => void;
  updateForm: (form: Partial<ProfileFormData>) => void;
  resetForm: (user: User | null) => void;
  initializeForm: (user: User) => void;
  cancelEdit: (user: User | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  editing: false,
  uploadingImage: false,
  form: { name: "", phone: "" },

  setEditing: (editing) => set({ editing }),
  setUploadingImage: (uploadingImage) => set({ uploadingImage }),

  updateForm: (formUpdate) =>
    set((state) => ({
      form: { ...state.form, ...formUpdate },
    })),

  resetForm: (user) =>
    set({
      form: {
        name: user?.name || "",
        phone: user?.phone || "",
      },
    }),

  initializeForm: (user) =>
    set({
      form: {
        name: user.name || "",
        phone: user.phone || "",
      },
    }),

  cancelEdit: (user) => {
    set({
      editing: false,
      form: {
        name: user?.name || "",
        phone: user?.phone || "",
      },
    });
  },
}));