"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Trash2,
  X,
  Mic,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useChatOperations } from "@/hooks/useChatData";
import MessageBubble from "./MessageBubble";
import { useVoice } from "@/lib/ai/voiceService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "../NavigationLoader";

const SUGGESTED_QUESTIONS = [
  "Show sofas under ₹50,000",
  "I need a king-size bed",
  "Browse all categories",
  "How many products are available?",
  "Furniture for my bedroom",
];

export default function ChatWindow() {
  const navigate = useNavigate();
  const { messages, isLoading, toggleChat, clearMessages } = useChatStore();
  const { sendMessage } = useChatOperations();

  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);

  /** 🔑 IMPORTANT: scroll container ref (NOT window) */
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    voiceEnabled,
    startListening,
    stopListening,
    toggleVoice,
    isSupported,
  } = useVoice();

  /* ================= SAFE CHAT SCROLL ================= */
  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isLoading) scrollToBottom();
  }, [isLoading, scrollToBottom]);

  // Auto-scroll during typing animation
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    });

    observer.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  /* ================= ACTIONS ================= */
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    await sendMessage(text, navigate);
  };

  const handleSuggestionClick = async (question: string) => {
    if (isLoading) return;
    setInput("");
    await sendMessage(question, navigate);
  };

  const handleVoiceInput = () => {
    if (isListening) stopListening();
    else startListening((t) => setInput(t));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`
        ${expanded ? "w-115" : "w-95"}
        h-140
        bg-white dark:bg-[#0f1419]
        border border-gray-100 dark:border-gray-800
        rounded-sm
        shadow-[0_2px_6px_rgba(0,0,0,0.22)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]
        flex flex-col
        overflow-hidden
        transition-all duration-300 ease-out
      `}
    >
      {/* ================= HEADER ================= */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-[#fafafa] dark:bg-gray-900/50">
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            VFurniture
          </h3>
          <p className="text-[11px]" style={{ color: "var(--brand-strong)" }}>
            ● Online · Ready to help
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ color: "var(--brand-strong)" }}
            aria-label={expanded ? "Minimize" : "Maximize"}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {isSupported && (
            <button
              onClick={toggleVoice}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              style={{ color: "var(--brand-strong)" }}
              aria-label={voiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              style={{ color: "var(--brand-strong)" }}
              aria-label="Clear messages"
            >
              <Trash2 size={16} />
            </button>
          )}

          <button
            onClick={toggleChat}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ color: "var(--brand-strong)" }}
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin overflow-x-hidden bg-white dark:bg-[#0f1419] px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center">
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              How can I help today?
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
              Find furniture, compare options, or ask anything.
            </p>

            <div className="grid grid-cols-1 gap-2 w-full">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(q)}
                  className="px-4 py-2.5 text-left text-sm rounded-md border transition-all"
                  style={{
                    borderColor: "var(--brand-muted)",
                    color: "var(--brand-strong)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand-strong)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand-muted)";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div
                className="mt-3 border rounded-md px-4 py-3 w-fit"
                style={{ borderColor: "var(--brand-muted)" }}
              >
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: "var(--brand)" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce delay-150"
                    style={{ backgroundColor: "var(--brand)" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce delay-300"
                    style={{ backgroundColor: "var(--brand)" }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ================= INPUT ================= */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1419]">
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
            aria-label="Upload file"
            style={{ color: "var(--brand-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--brand-strong)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--brand-muted)";
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 bg-transparent outline-none text-[13px] text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            disabled={isLoading}
          />

          {isSupported && (
            <button
              onClick={handleVoiceInput}
              className={`p-1 transition-colors shrink-0`}
              style={{ color: isListening ? "#ef4444" : "var(--brand-muted)" }}
              onMouseEnter={(e) => {
                if (!isListening)
                  e.currentTarget.style.color = "var(--brand-strong)";
              }}
              onMouseLeave={(e) => {
                if (!isListening)
                  e.currentTarget.style.color = "var(--brand-muted)";
              }}
              aria-label="Voice input"
            >
              <Mic size={18} />
            </button>
          )}

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded-md text-white transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed shrink-0"
            style={{
              backgroundColor:
                input.trim() && !isLoading ? "var(--brand-strong)" : undefined,
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !isLoading) {
                e.currentTarget.style.backgroundColor = "var(--brand-dark)";
              }
            }}
            onMouseLeave={(e) => {
              if (input.trim() && !isLoading) {
                e.currentTarget.style.backgroundColor = "var(--brand-strong)";
              }
            }}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
