import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  authLoading: boolean;
  setAuthenticated: (value: boolean) => void;
  setAuthLoading: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  authLoading: true, // Start as true, will be set to false once auth check completes
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setAuthLoading: (value) => set({ authLoading: value }),
  logout: () => set({ isAuthenticated: false }),
}));