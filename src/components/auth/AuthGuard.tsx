'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { fetchWithCredentials, handleApiResponse } from '@/utils/fetchWithCredentials';
import Loading from '@/components/ui/Loader';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role?: string;
  createdAt: string;
}

interface AuthGuardProps {
  children: (user: User) => ReactNode;
  redirectTo?: string;
  loadingMessage?: string;
}

export const AuthGuard = ({ 
  children, 
  redirectTo = '/auth/signin',
  loadingMessage = 'Loading...'
}: AuthGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setAuthenticated, setAuthLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
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
            setAuthenticated(false);
            router.push(redirectTo);
          }
        } else if (res.status === 401) {
          // Try to refresh token
          const refreshRes = await fetchWithCredentials("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });
          
          if (refreshRes.ok) {
            // Retry fetching user after refresh
            await fetchUser();
            return;
          } else {
            setAuthenticated(false);
            router.push(redirectTo);
          }
        } else {
          setAuthenticated(false);
          router.push(redirectTo);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setAuthenticated(false);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
        setAuthLoading(false);
      }
    };

    fetchUser();
  }, [redirectTo, router, setAuthenticated, setAuthLoading]);

  if (isLoading) {
    return <Loading fullScreen message={loadingMessage} />;
  }

  if (!user) {
    return <Loading fullScreen message="Redirecting..." />;
  }

  return <>{children(user)}</>;
};