'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ChatWindow from './ChatWindow';
import { useChatStore } from '@/stores/chatStore';

export default function ChatWidget() {
  const { isOpen, toggleChat } = useChatStore();

  return (
    <>
      {/* Chat window */}
      {isOpen && (
        <motion.div
          key="chat-window"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.2,
            ease: [0.16, 1, 0.3, 1] // Smooth easing, no bounce
          }}
          style={{
            transformOrigin: 'bottom right',
            position: 'fixed',
            right: '20px',
            bottom: '28px',
            zIndex: 9998,
          }}
        >
          <ChatWindow />
        </motion.div>
      )}

      {/* Floating trigger */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          aria-label="Open chat"
          className="
            fixed bottom-5 right-5
            w-12 h-12
            rounded-full
            z-9999
            grid place-items-center
            text-white
            shadow-[0_2px_6px_rgba(0,0,0,0.22)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]
            hover:scale-110
            transition-transform
          "
          style={{ backgroundColor: 'var(--brand-strong)' }}
        >
          <MessageCircle size={20} />
        </button>
      )}
    </>
  );
}