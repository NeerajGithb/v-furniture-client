// components/auth/reset/VerifyCodeStep.tsx

"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { OTPInputProps } from "../types";

const smoothEasing: [number, number, number, number] = [0.4, 0, 0.2, 1];
const easeOut: [number, number, number, number] = [0.0, 0.0, 0.2, 1];
const stepVariants = {
  enter: { x: "20%", opacity: 0 },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { duration: 0.4, ease: smoothEasing },
      opacity: { duration: 0.3, ease: easeOut },
    },
  },
  exit: {
    x: "-20%",
    opacity: 0,
    transition: { duration: 0.3, ease: smoothEasing },
  },
};

export default function VerifyCodeStep({
  loading,
  error,
  code,
  email,
  onCodeChange,
  onResend,
  allowImmediateResend = false, // New prop for signup email verification
}: Omit<OTPInputProps, "onSubmit"> & { allowImmediateResend?: boolean }) {
  const [countdown, setCountdown] = useState(allowImmediateResend ? 0 : 30);
  const [canResend, setCanResend] = useState(allowImmediateResend);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = () => {
    if (canResend && !loading) {
      onResend();
      setCountdown(30);
      setCanResend(false);
    }
  };

  return (
    <motion.div
      className="space-y-3"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      <div className="text-center space-y-1">
        <motion.div
          className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full mb-3"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: smoothEasing }}
        >
          <Mail className="w-4 h-4 text-black dark:text-white" />
        </motion.div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Check your email
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          We sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div
        className="flex justify-center gap-2"
        onPaste={(e) => {
          const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);
          if (pasted.length === 6) {
            onCodeChange(pasted);
          }
          e.preventDefault();
        }}
      >
        {Array(6)
          .fill("")
          .map((_, i) => (
            <motion.input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-8 h-8 text-center text-sm font-semibold border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:outline-none transition-colors bg-transparent disabled:opacity-50 text-gray-900 dark:text-gray-100"
              value={code[i] || ""}
              disabled={loading}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2, delay: i * 0.1, ease: smoothEasing }}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (!val) return;

                const newCode = code.split("");
                newCode[i] = val[0];
                onCodeChange(newCode.join(""));

                const next = e.target.nextSibling as HTMLInputElement;
                if (val && next?.focus) next.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  const newCode = code.split("");
                  newCode[i] = "";
                  onCodeChange(newCode.join(""));

                  if (i > 0 && !code[i]) {
                    const prev = e.currentTarget
                      .previousSibling as HTMLInputElement;
                    if (prev?.focus) prev.focus();
                  }
                }
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = "rgba(0,0,0,0.02)";
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            />
          ))}
      </div>

      {error && (
        <motion.div
          className="text-xs text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15, ease: smoothEasing }}
        >
          {error}
        </motion.div>
      )}

      <div className="text-center">
        {canResend ? (
          <motion.button
            type="button"
            disabled={loading}
            onClick={handleResend}
            className="text-xs text-black dark:text-white hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            Resend verification code
          </motion.button>
        ) : (
          <motion.p
            className="text-xs text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            Resend code in {countdown}s
          </motion.p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Didn't receive the code? Check your spam folder
        </p>
      </div>
    </motion.div>
  );
}
