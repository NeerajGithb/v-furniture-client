"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import ChatWindow from "./ChatWindow";
import { useChatStore } from "@/stores/chatStore";

export default function ChatWidget() {
  const { isOpen, toggleChat } = useChatStore();

  return (
    <>
      {/* Chat window */}
      {isOpen && (
        <motion.div
          key="chat-window"
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            transformOrigin: "bottom right",
            position: "fixed",
            right: "20px",
            bottom: "28px",
            zIndex: 9998,
            filter: "drop-shadow(0 30px 60px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.1))",
          }}
        >
          <ChatWindow />
        </motion.div>
      )}

      {/* Floating trigger */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleChat}
          aria-label="Open chat"
          className="
            fixed bottom-5 right-5
            w-10 h-10
            rounded-full
            z-9999
            grid place-items-center
            text-white
            shadow-[0_8px_24px_rgba(237,125,49,0.4),0_4px_12px_rgba(0,0,0,0.2)] 
            dark:shadow-[0_8px_24px_rgba(237,125,49,0.5),0_4px_12px_rgba(0,0,0,0.4)]
            hover:shadow-[0_12px_32px_rgba(237,125,49,0.5),0_6px_16px_rgba(0,0,0,0.25)]
            transition-all duration-200
            bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700
            ring-2 ring-white/20 dark:ring-white/10
          "
        >
          <MessageCircle size={18} strokeWidth={2.5} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse shadow-lg shadow-green-500/50"></span>
        </motion.button>
      )}
    </>
  );
}
