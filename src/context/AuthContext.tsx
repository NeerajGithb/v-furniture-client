"use client";

import {
  fetchWithCredentials,
  handleApiResponse,
} from "@/utils/fetchWithCredentials";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useHomeStore } from "@/stores/homeStore";
import { useCartStore } from "@/stores/cartStore";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
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
        // Token refreshed successfully, fetch user data
        await fetchUser();
        return true;
      } else {
        // Refresh token expired or invalid
        setUser(null);
        setAuthenticated(false);
        return false;
      }
    } catch (err) {
      console.error("Token refresh error:", err);
      setUser(null);
      setAuthenticated(false);
      return false;
    }
  };

  // Fetch user from server
  const fetchUser = async (): Promise<void> => {
    setAuthLoading(true);
    try {
      const res = await fetchWithCredentials("/api/auth/current-user", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await handleApiResponse(res);
        if (data?.user) {
          setUser(data.user);
          setAuthenticated(true);
        } else {
          setUser(null);
          setAuthenticated(false);
        }
      } else if (res.status === 401) {
        // Access token expired, try to refresh
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
      // Only log unexpected errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Auth fetch error:", err);
      }
      setUser(null);
      setAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  // Refetch user data
  const refetch = async (): Promise<void> => {
    await fetchUser();
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      // 1. Call server logout first
      await fetchWithCredentials("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
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
      resetHomeStore();
      resetCheckout();
      
      // 4. Clear localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("checkout-store");
          localStorage.removeItem("cart-storage");
          localStorage.removeItem("vf_user_cache");
          sessionStorage.clear();
        } catch (error) {
          console.warn("Failed to clear persisted data:", error);
        }
      }
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Auto-refresh token every 12 minutes (before 15min expiry)
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 12 * 60 * 1000); // 12 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
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