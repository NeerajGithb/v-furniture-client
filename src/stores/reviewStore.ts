import { create } from "zustand";

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  images: { url: string; publicId: string }[];
}

interface ReviewStore {
  showReviewForm: boolean;
  formData: ReviewFormData;
  hoveredRating: number;
  currentFilter: string;
  currentUserId: string | null;

  setShowReviewForm: (show: boolean) => void;
  setHoveredRating: (rating: number) => void;
  setFormData: (data: Partial<ReviewFormData>) => void;
  resetForm: () => void;
  setFilter: (filter: string) => void;
  setCurrentUserId: (userId: string | null) => void;
  removeImage: (index: number) => void;
}

const defaultFormData: ReviewFormData = {
  rating: 0,
  title: "",
  comment: "",
  images: [],
};

const useReviewStore = create<ReviewStore>((set) => ({
  showReviewForm: false,
  formData: defaultFormData,
  hoveredRating: 0,
  currentFilter: "all",
  currentUserId: null,

  setShowReviewForm: (show) => set({ showReviewForm: show }),
  setHoveredRating: (rating) => set({ hoveredRating: rating }),
  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),
  resetForm: () => set({ formData: { ...defaultFormData }, hoveredRating: 0 }),
  setFilter: (filter) => set({ currentFilter: filter }),
  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  removeImage: (index) => {
    set((state) => {
      const newImages = [...state.formData.images];
      newImages.splice(index, 1);
      return {
        formData: {
          ...state.formData,
          images: newImages,
        },
      };
    });
  },
}));

export default useReviewStore;