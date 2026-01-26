// components/auth/hooks/useAuthHandlers.ts

import { useAuth } from "@/context/AuthContext";
import {
  fetchWithCredentials,
  handleApiResponse,
} from "@/utils/fetchWithCredentials";
import { handleAuthError } from "@/lib/security/handleAuthError";
import { isValidEmail, isValidPassword } from "@/utils/validators";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { normalizeError } from "@/utils/normalizeError";

export const useAuthHandlers = () => {
  const { refetch } = useAuth();

  const fetchUserAfterAuth = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error(
        "❌ Failed to fetch user after login:",
        getErrorMessage(err),
      );
    }
  };

  const handleLogin = async (
    email: string,
    password: string,
    setError: (error: string | null) => void,
    setIsOAuth: (isOAuth: boolean) => void,
  ) => {
    if (!isValidEmail(email)) {
      setError("Invalid email address.");
      return false;
    }
    if (!isValidPassword(password)) {
      setError("Password must be at least 6 characters.");
      return false;
    }

    try {
      const res = await fetchWithCredentials("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const json = await handleApiResponse(res);
      if (!res.ok) throw { status: res.status, body: json };

      toast.success("Welcome back! Login successful.");
      await fetchUserAfterAuth();
      return true;
    } catch (err) {
      const error = normalizeError(err);

      console.warn("[Mongo] Login error", error.status, error.body);
      handleAuthError(error.status || 500, error.body, setError);

      // Check if email exists with OAuth
      try {
        const res = await fetchWithCredentials("/api/auth/check-email-exists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await handleApiResponse(res);
        if (data.exists && data.hasOAuth) {
          setIsOAuth(true);
        }
      } catch (checkErr) {
        console.error("Email check error:", checkErr);
      }

      return false;
    }
  };

  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    setError: (error: string | null) => void,
  ): Promise<boolean | { requiresVerification: true; email: string; name: string }> => {
    if (!isValidEmail(email)) {
      setError("Invalid email address.");
      return false;
    }
    if (!isValidPassword(password)) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    try {
      const res = await fetchWithCredentials("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name || "No Name",
          email,
          password,
        }),
      });

      const json = await handleApiResponse(res);
      if (!res.ok) throw { status: res.status, body: json };

      // Check if email verification is required
      if (json.requiresVerification) {
        toast.success("Account created! Please check your email for verification code.");
        return { requiresVerification: true, email, name: name || "User" };
      }

      // OAuth users are logged in immediately
      toast.success("Account created successfully! Welcome aboard.");
      await fetchUserAfterAuth();
      return true;
    } catch (err) {
      const error = normalizeError(err);
      handleAuthError(error.status || 500, error.body, setError);
      return false;
    }
  };

  const handleSendResetCode = async (email: string) => {
    const res = await fetchWithCredentials("/api/auth/send-reset-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await handleApiResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "Failed to send reset code");
    }

    return data;
  };

  const handleVerifyCode = async (email: string, code: string) => {
    const res = await fetchWithCredentials("/api/auth/verify-reset-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: code.trim() }),
    });

    const data = await handleApiResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "Invalid verification code");
    }

    return data;
  };

  const handleResetPassword = async (
    email: string,
    code: string,
    newPassword: string,
  ) => {
    const res = await fetchWithCredentials("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });

    const data = await handleApiResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "Password reset failed");
    }

    return data;
  };

  const handleSendVerificationCode = async (email: string, name: string) => {
    const res = await fetchWithCredentials("/api/auth/send-verification-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });

    const data = await handleApiResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "Failed to send verification code");
    }

    return data;
  };

  const handleVerifyEmailCode = async (email: string, code: string) => {
    const res = await fetchWithCredentials("/api/auth/verify-email-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: code.trim() }),
    });

    const data = await handleApiResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "Invalid verification code");
    }

    return data;
  };

  return {
    handleLogin,
    handleSignup,
    handleSendResetCode,
    handleVerifyCode,
    handleResetPassword,
    handleSendVerificationCode,
    handleVerifyEmailCode,
  };
};