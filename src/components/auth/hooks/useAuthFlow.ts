// components/auth/hooks/useAuthFlow.ts

import { useState } from "react";
import { AuthState, ResetPasswordState } from "../types";

interface EmailVerificationState {
  showVerification: boolean;
  email: string;
  name: string;
  code: string;
  codeError: string;
}

export const useAuthFlow = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLogin: true,
    showPassword: false,
    loading: false,
    emailPassError: null,
    showForgotPassword: false,
    isOAuth: false,
  });

  const [resetState, setResetState] = useState<ResetPasswordState>({
    step: 1,
    enteredEmail: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
    codeError: "",
    passError: null,
  });

  const [verificationState, setVerificationState] =
    useState<EmailVerificationState>({
      showVerification: false,
      email: "",
      name: "",
      code: "",
      codeError: "",
    });

  const toggleMode = () => {
    setAuthState((prev) => ({
      ...prev,
      isLogin: !prev.isLogin,
      emailPassError: null,
      showPassword: false,
    }));
  };

  const togglePassword = () => {
    setAuthState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const setLoading = (loading: boolean) => {
    setAuthState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setAuthState((prev) => ({ ...prev, emailPassError: error }));
  };

  const setIsOAuth = (isOAuth: boolean) => {
    setAuthState((prev) => ({ ...prev, isOAuth }));
  };

  const showForgotPassword = () => {
    setAuthState((prev) => ({
      ...prev,
      showForgotPassword: true,
      emailPassError: null,
    }));
  };

  const hideForgotPassword = () => {
    setAuthState((prev) => ({ ...prev, showForgotPassword: false }));
    resetPasswordFlow();
  };

  // Email Verification functions
  const showEmailVerification = (email: string, name: string) => {
    setVerificationState({
      showVerification: true,
      email,
      name,
      code: "",
      codeError: "",
    });
  };

  const hideEmailVerification = () => {
    setVerificationState({
      showVerification: false,
      email: "",
      name: "",
      code: "",
      codeError: "",
    });
  };

  const setVerificationCode = (code: string) => {
    setVerificationState((prev) => ({ ...prev, code, codeError: "" }));
  };

  const setVerificationCodeError = (error: string) => {
    setVerificationState((prev) => ({ ...prev, codeError: error }));
  };

  const setResetStep = (step: 1 | 2 | 3) => {
    setResetState((prev) => ({ ...prev, step }));
  };

  const setResetEmail = (email: string) => {
    setResetState((prev) => ({ ...prev, enteredEmail: email }));
  };

  const setResetCode = (code: string) => {
    setResetState((prev) => ({ ...prev, code, codeError: "" }));
  };

  const setResetCodeError = (error: string) => {
    setResetState((prev) => ({ ...prev, codeError: error }));
  };

  const setNewPassword = (password: string) => {
    setResetState((prev) => ({
      ...prev,
      newPassword: password,
      passError: null,
    }));
  };

  const setConfirmPassword = (password: string) => {
    setResetState((prev) => ({
      ...prev,
      confirmPassword: password,
      passError: null,
    }));
  };

  const setPasswordError = (error: string | null) => {
    setResetState((prev) => ({ ...prev, passError: error }));
  };

  const resetPasswordFlow = () => {
    setResetState({
      step: 1,
      enteredEmail: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
      codeError: "",
      passError: null,
    });
  };

  const reset = () => {
    setAuthState({
      isLogin: true,
      showPassword: false,
      loading: false,
      emailPassError: null,
      showForgotPassword: false,
      isOAuth: false,
    });
    resetPasswordFlow();
    hideEmailVerification();
  };

  return {
    authState,
    resetState,
    verificationState,
    toggleMode,
    togglePassword,
    setLoading,
    setError,
    setIsOAuth,
    showForgotPassword,
    hideForgotPassword,
    showEmailVerification,
    hideEmailVerification,
    setVerificationCode,
    setVerificationCodeError,
    setResetStep,
    setResetEmail,
    setResetCode,
    setResetCodeError,
    setNewPassword,
    setConfirmPassword,
    setPasswordError,
    reset,
  };
};
