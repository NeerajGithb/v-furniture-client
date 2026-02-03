// components/auth/login/LoginForm.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { AuthFormProps } from "../types";
import GoogleLoginButton from "../oauth/GoogleLoginButton";

const smoothEasing: [number, number, number, number] = [0.4, 0, 0.2, 1];

export default function LoginForm({
  loading,
  error,
  isOAuth,
  showPassword,
  onTogglePassword,
  onSubmit,
  onClearError,
  onSwitchMode,
  onForgotPassword,
  onGoogleLogin,
}: AuthFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-2 flex-1 flex flex-col justify-center min-h-87.5"
    >
      <motion.div
        className="relative"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.05, ease: smoothEasing }}
      >
        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs" />
        <input
          name="email"
          type="email"
          placeholder="Email address"
          className="w-full pl-8 pr-3 py-2 border-0 border-b border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:outline-none transition-colors bg-transparent dark:bg-transparent text-sm dark:text-white dark:placeholder-gray-500 disabled:opacity-50"
          required
          disabled={loading}
          onChange={onClearError}
          onFocus={(e) => {
            e.target.style.backgroundColor = "rgba(0,0,0,0.02)";
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        />
      </motion.div>

      <motion.div
        className="relative"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.1, ease: smoothEasing }}
      >
        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs" />
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full pl-8 pr-8 py-2 border-0 border-b border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:outline-none transition-colors bg-transparent dark:bg-transparent text-sm dark:text-white dark:placeholder-gray-500 disabled:opacity-50"
          required
          disabled={loading}
          onChange={onClearError}
          onFocus={(e) => {
            e.target.style.backgroundColor = "rgba(0,0,0,0.02)";
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        />
        <motion.button
          type="button"
          disabled={loading}
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors text-xs disabled:opacity-50"
          whileHover={!loading ? { scale: 1.05 } : {}}
          whileTap={!loading ? { scale: 0.95 } : {}}
          transition={{ duration: 0.1 }}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </motion.button>
      </motion.div>

      <motion.div
        className="text-right"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.15, ease: smoothEasing }}
      >
        <button
          type="button"
          disabled={loading}
          onClick={onForgotPassword}
          className="text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Forgot password?
        </button>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.2, ease: smoothEasing }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 space-y-1"
          >
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 text-red-500 dark:text-red-400 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M12 19a7 7 0 100-14 7 7 0 000 14z"
                  />
                </svg>
              </div>
              <span className="text-xs text-red-700 dark:text-red-300">
                {error}
              </span>
            </div>

            {isOAuth && (
              <div className="bg-white dark:bg-gray-800 rounded border border-red-100 dark:border-red-900 p-2 space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  This email is linked to a Google account.
                </p>
                <motion.button
                  onClick={onGoogleLogin}
                  type="button"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!loading ? { scale: 1.01 } : {}}
                  whileTap={!loading ? { scale: 0.99 } : {}}
                  transition={{ duration: 0.1 }}
                >
                  <FcGoogle className="w-3 h-3" />
                  Continue with Google
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        className="w-full bg-black dark:bg-gray-800 text-white py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.2, ease: smoothEasing }}
        whileHover={!loading ? { scale: 1.01 } : {}}
        whileTap={!loading ? { scale: 0.99 } : {}}
      >
        {loading ? "Signing in..." : "Sign In"}
      </motion.button>

      <motion.div
        className="relative flex items-center justify-center my-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.25, ease: smoothEasing }}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative bg-white dark:bg-gray-900 px-3 text-xs text-gray-500 dark:text-gray-400">
          or continue with
        </div>
      </motion.div>

      <GoogleLoginButton loading={loading} onClick={onGoogleLogin} />

      <motion.div
        className="text-center pt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.35, ease: smoothEasing }}
      >
        <span className="text-gray-600 dark:text-gray-400 text-xs">
          Don't have an account?
        </span>
        <motion.button
          type="button"
          disabled={loading}
          onClick={onSwitchMode}
          className="ml-2 text-black dark:text-white font-medium hover:underline transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!loading ? { scale: 1.02 } : {}}
          transition={{ duration: 0.1 }}
        >
          Sign up
        </motion.button>
      </motion.div>
    </form>
  );
}
