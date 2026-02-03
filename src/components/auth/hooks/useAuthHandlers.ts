// components/auth/hooks/useAuthHandlers.ts

import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

export const useAuthHandlers = () => {
  const { refetch } = useAuth();

  // Handle user login with email and password
  const handleLogin = async (
    email: string,
    password: string,
    setError: (error: string | null) => void,
  ) => {
    try {
      await authService.login({ email, password });
      await refetch();
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  // Handle user registration and email verification flow
  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    setError: (error: string | null) => void,
  ): Promise<
    boolean | { requiresVerification: true; email: string; name: string }
  > => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    try {
      const result = await authService.register({
        name: name,
        email,
        password,
      });

      if (result.requiresVerification) {
        return { requiresVerification: true, email, name: name };
      }
      await refetch();
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  // Send password reset code to user's email
  const handleSendResetCode = async (email: string) => {
    try {
      return await authService.sendResetCode({ email });
    } catch (error: any) {
      throw error; // Re-throw to be handled by the calling component
    }
  };

  // Verify password reset code
  const handleVerifyCode = async (email: string, code: string) => {
    try {
      return await authService.verifyResetCode({ email, code: code.trim() });
    } catch (error: any) {
      throw error; // Re-throw to be handled by the calling component
    }
  };

  // Reset user password with new password
  const handleResetPassword = async (email: string, newPassword: string) => {
    try {
      return await authService.resetPassword({ email, newPassword });
    } catch (error: any) {
      throw error; // Re-throw to be handled by the calling component
    }
  };

  // Resend OTP for email verification
  const handleResendOTP = async (email: string) => {
    try {
      return await authService.resendOTP({ email });
    } catch (error: any) {
      throw error; // Re-throw to be handled by the calling component
    }
  };

  // Send verification code for email verification
  const handleSendVerificationCode = async (email: string, name?: string) => {
    return handleResendOTP(email);
  };

  // Verify email code and log user in
  const handleVerifyEmailCode = async (email: string, code: string) => {
    try {
      const result = await authService.verifyEmailCode({
        email,
        code: code.trim(),
      });
      return result;
    } catch (error: any) {
      throw error; // Re-throw to be handled by the calling component
    }
  };

  return {
    handleLogin,
    handleSignup,
    handleSendResetCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendOTP,
    handleSendVerificationCode,
    handleVerifyEmailCode,
  };
};
