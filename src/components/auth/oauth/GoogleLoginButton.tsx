// components/auth/oauth/GoogleLoginButton.tsx

"use client";

import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";

interface GoogleLoginButtonProps {
  loading: boolean;
  onClick: () => void;
}

export default function GoogleLoginButton({
  loading,
  onClick,
}: GoogleLoginButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={loading}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      whileHover={!loading ? { scale: 1.01 } : {}}
      whileTap={!loading ? { scale: 0.99 } : {}}
    >
      <FcGoogle className="w-4 h-4" />
      Continue with Google
    </motion.button>
  );
}
