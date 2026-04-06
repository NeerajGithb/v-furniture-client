import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  authLoading: boolean;
  isAuthModalOpen: boolean;
  setAuthenticated: (value: boolean) => void;
  setAuthLoading: (value: boolean) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  authLoading: true,
  isAuthModalOpen: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setAuthLoading: (value) => set({ authLoading: value }),
  logout: () => set({ isAuthenticated: false }),
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
