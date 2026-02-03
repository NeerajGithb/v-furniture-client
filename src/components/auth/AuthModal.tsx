// components/auth/AuthModal.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { AuthModalProps } from "./types";
import { useAuthFlow } from "./hooks/useAuthFlow";
import { useAuthHandlers } from "./hooks/useAuthHandlers";
import { useAuth } from "@/context/AuthContext";
import AuthContent from "./AuthContent";

const smoothEasing: [number, number, number, number] = [0.4, 0, 0.2, 1];
const modalVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { duration: 0.4, ease: smoothEasing },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.3, ease: smoothEasing },
  },
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { refetch } = useAuth();
  const {
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
  } = useAuthFlow();

  const {
    handleLogin,
    handleSignup,
    handleSendResetCode,
    handleVerifyCode,
    handleResetPassword,
    handleSendVerificationCode,
    handleVerifyEmailCode,
  } = useAuthHandlers();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (authState.isLogin) {
      const success = await handleLogin(email, password, setError);

      if (success) {
        setTimeout(() => handleClose(), 100);
      }
    } else {
      const result = await handleSignup(
        name,
        email,
        password,
        confirmPassword,
        setError,
      );

      if (
        result &&
        typeof result === "object" &&
        "requiresVerification" in result &&
        result.requiresVerification
      ) {
        showEmailVerification(result.email, result.name);
      } else if (result === true) {
        setTimeout(() => handleClose(), 100);
      }
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    setError(null);
    setIsOAuth(true);
    setLoading(true);

    const originalUrl = window.location.href;
    window.location.href = "/api/oauth/google";

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        window.location.href === originalUrl
      ) {
        setTimeout(() => {
          setLoading(false);
          setIsOAuth(false);
        }, 500);
      }
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted || window.performance?.navigation?.type === 2) {
        setLoading(false);
        setIsOAuth(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    }, 60000);
  };

  const handleForgotPasswordSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("resetEmail")?.toString().trim();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await handleSendResetCode(email);
      setResetEmail(email);
      setResetStep(2);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleVerifyCodeSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setResetCodeError("");
    setLoading(true);

    try {
      await handleVerifyCode(resetState.enteredEmail, resetState.code);
      setResetStep(3);
    } catch (err: any) {
      setResetCodeError(err.message);
    }

    setLoading(false);
  };

  const handleResetPasswordSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setPasswordError(null);

    if (!resetState.newPassword || resetState.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (resetState.newPassword !== resetState.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await handleResetPassword(
        resetState.enteredEmail,
        resetState.newPassword,
      );
      reset();
      hideForgotPassword();
    } catch (err: any) {
      setPasswordError(err.message);
    }

    setLoading(false);
  };

  const handleVerifyEmailSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setVerificationCodeError("");
    setLoading(true);

    try {
      await handleVerifyEmailCode(
        verificationState.email,
        verificationState.code,
      );

      // Fetch user data and log them in
      await refetch();

      // Close modal
      setTimeout(() => handleClose(), 100);
    } catch (err: any) {
      // If registration session expired, redirect back to signup
      if (
        err.message?.includes("PENDING_REGISTRATION_NOT_FOUND") ||
        err.message?.includes("registration session has expired")
      ) {
        toast.error("Registration session expired. Please sign up again.");
        // Reset to signup form
        reset();
        hideForgotPassword();
        return;
      }

      setVerificationCodeError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      await handleSendVerificationCode(
        verificationState.email,
        verificationState.name,
      );
    } catch (err: any) {
      // If registration session expired, redirect back to signup
      if (
        err.message?.includes("PENDING_REGISTRATION_NOT_FOUND") ||
        err.message?.includes("registration session has expired")
      ) {
        toast.error("Registration session expired. Please sign up again.");
        // Reset to signup form
        reset();
        hideForgotPassword();
        return;
      }
      toast.error(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-9999 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`bg-white dark:bg-gray-900 rounded-sm shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex relative ${
            authState.loading ? "pointer-events-none opacity-90" : ""
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all shadow-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <X className="w-4 h-4" />
          </motion.button>

          {authState.loading && (
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-black overflow-hidden z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                className="h-full bg-white"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                  duration: 1.2,
                }}
              />
            </motion.div>
          )}

          {/* Left Side - Auth Forms */}
          <div className="w-full md:w-[55%] p-4 flex flex-col justify-center overflow-hidden max-h-[90vh]">
            <div className="flex flex-col justify-center min-h-125">
              <AuthContent
                isLogin={authState.isLogin}
                showForgotPassword={authState.showForgotPassword}
                showEmailVerification={verificationState.showVerification}
                loading={authState.loading}
                error={authState.emailPassError}
                isOAuth={authState.isOAuth}
                showPassword={authState.showPassword}
                resetStep={resetState.step}
                resetEmail={resetState.enteredEmail}
                resetCode={resetState.code}
                newPassword={resetState.newPassword}
                confirmPassword={resetState.confirmPassword}
                codeError={resetState.codeError}
                passError={resetState.passError}
                verificationEmail={verificationState.email}
                verificationCode={verificationState.code}
                verificationCodeError={verificationState.codeError}
                onToggleMode={toggleMode}
                onTogglePassword={togglePassword}
                onClearError={() => setError(null)}
                onShowForgotPassword={showForgotPassword}
                onHideForgotPassword={hideForgotPassword}
                onGoogleLogin={handleGoogleLogin}
                onEmailAuth={handleEmailAuth}
                onSendResetCode={handleForgotPasswordSubmit}
                onVerifyCode={handleVerifyCodeSubmit}
                onResetPassword={handleResetPasswordSubmit}
                onVerifyEmail={handleVerifyEmailSubmit}
                onResendVerificationCode={handleResendVerificationCode}
                onCodeChange={setResetCode}
                onPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onVerificationCodeChange={setVerificationCode}
              />
            </div>
          </div>

          {/* Right Side - Image */}
          <motion.div
            className="hidden md:flex w-[45%] relative overflow-hidden max-h-[90vh]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.25,
              ease: smoothEasing,
              delay: 0.05,
            }}
          >
            <div className="absolute inset-0 bg-linear-to-br from-gray-50 dark:from-gray-800 to-gray-100 dark:to-gray-900" />

            <div className="absolute inset-0 flex items-center justify-center max-h-[90vh]">
              <motion.div
                className="relative w-full h-full"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, ease: smoothEasing }}
              >
                <Image
                  src="/offer.jpeg"
                  alt="Offer Poster"
                  fill
                  className="object-cover"
                  priority
                  sizes="45vw"
                />
                <div className="absolute inset-0 bg-black/5" />
              </motion.div>
            </div>

            {/* Floating decorative elements */}
            <motion.div
              className="absolute top-16 right-16 w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.15, ease: smoothEasing }}
            />
            <motion.div
              className="absolute bottom-16 left-16 w-8 h-8 bg-white/15 rounded-full backdrop-blur-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.25, ease: smoothEasing }}
            />
            <motion.div
              className="absolute top-1/2 left-8 w-6 h-6 bg-white/10 rounded-full backdrop-blur-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.35, ease: smoothEasing }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
