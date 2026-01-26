'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthStore } from '@/stores/authStore';

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // No initialization needed - React Query handles data fetching automatically
  return <>{children}</>;
};

export const useStoresReady = () => {
  const { user } = useCurrentUser();
  const { authLoading } = useAuthStore();

  // Stores are always ready since React Query manages data fetching
  const storesReady = !authLoading;

  return {
    storesReady,
    authLoading,
    cartInitialized: true,
    wishlistInitialized: true,
    isAuthenticated: !!user?.id,
  };
};