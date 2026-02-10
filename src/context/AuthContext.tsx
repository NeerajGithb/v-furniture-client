"use client";

import {
  fetchWithCredentials,
  handleApiResponse,
} from "@/utils/fetchWithCredentials";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useHomeStore } from "@/stores/homeStore";
import { useCartStore } from "@/stores/cartStore";
import { User } from "@/types/user";
import { authService } from "@/services/authService";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoadingLocal] = useState(true);
  const queryClient = useQueryClient();
  const { setAuthenticated, setAuthLoading } = useAuthStore();
  const { reset: resetHomeStore } = useHomeStore();
  const { resetCheckout } = useCartStore();

  // Refresh access token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const res = await fetchWithCredentials("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        await fetchUser();
        return true;
      } else {
        setUser(null);
        setAuthenticated(false);
        return false;
      }
    } catch (err) {
      setUser(null);
      setAuthenticated(false);
      return false;
    }
  };

  // Fetch user from server
  const fetchUser = async (): Promise<void> => {
    setAuthLoadingLocal(true);
    setAuthLoading(true);

    try {
      const res = await fetchWithCredentials("/api/auth/current-user", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const response = await handleApiResponse(res);
        if (response?.data?.user) {
          const userData = {
            ...response.data.user,
            _id: response.data.user.id,
          };
          setUser(userData);
          setAuthenticated(true);
        } else {
          setUser(null);
          setAuthenticated(false);
        }
      } else if (res.status === 401) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          setUser(null);
          setAuthenticated(false);
        }
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setAuthenticated(false);
    } finally {
      setAuthLoadingLocal(false);
      setAuthLoading(false);
    }
  };

  // Refetch user data (used after login/verification)
  const refetch = async (): Promise<void> => {
    await fetchUser();
  };

  // Logout
  const logout = async (): Promise<boolean> => {
    let serverSuccess = false;

    try {
      // 1. Call server logout using authService
      await authService.logout();
      serverSuccess = true;
    } catch (err) { }

    // 2. Clear React Query cache (user-specific data only)
    queryClient.removeQueries({ queryKey: ["cart"] });
    queryClient.removeQueries({ queryKey: ["wishlist"] });
    queryClient.removeQueries({ queryKey: ["orders"] });
    queryClient.removeQueries({ queryKey: ["addresses"] });
    queryClient.removeQueries({ queryKey: ["profile"] });
    queryClient.removeQueries({ queryKey: ["user-counts"] });

    // 3. Clear local state (always, even if server call fails)
    setUser(null);
    setAuthenticated(false);
    resetHomeStore(); // Reset user-specific cart/wishlist IDs
    resetCheckout(); // Reset user-specific checkout state

    // 4. Clear localStorage (user-specific data only)
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("checkout-store");
        localStorage.removeItem("cart-storage");
        localStorage.removeItem("vf_user_cache");
        sessionStorage.clear();
      } catch (error) { }
    }

    // 5. Show toast messages
    if (serverSuccess) {
      toast.success("Logged out successfully");
    } else {
      toast.error("Logout failed on server, but local data cleared");
    }

    return serverSuccess;
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Auto-refresh token every 12 minutes (before 15min expiry) - only when user is authenticated
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(
      () => {
        // Only refresh if user is still authenticated
        if (user) {
          refreshToken();
        }
      },
      12 * 60 * 1000,
    ); // 12 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Listen for profile updates and refetch
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchUser();
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        refetch,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
