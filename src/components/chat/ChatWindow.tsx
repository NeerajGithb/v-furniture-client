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
  MessageCircle,
} from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useChatOperations } from "@/hooks/useChatData";
import MessageBubble from "./MessageBubble";
import { useVoice } from "@/lib/ai/voiceService";
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
        bg-gradient-to-b from-white to-gray-50/50 dark:from-[#0f1419] dark:to-[#0a0d11]
        border border-gray-200/60 dark:border-gray-700/50
        rounded-tr-3xl
        shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35),0_10px_30px_-10px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)] 
        dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_10px_30px_-10px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)]
        backdrop-blur-xl
        flex flex-col
        overflow-hidden
        transition-all duration-300 ease-out
        ring-1 ring-black/5 dark:ring-white/5
      `}
    >
      {/* ================= HEADER ================= */}
      <div className="px-4 py-3 border-b border-gray-200/60 dark:border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <MessageCircle size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              VFurniture AI
            </h3>
            <p className="text-[11px] flex items-center gap-1.5" style={{ color: "var(--brand-strong)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50"></span>
              Online · Ready to help
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all hover:scale-105 active:scale-95"
            style={{ color: "var(--brand-strong)" }}
            aria-label={expanded ? "Minimize" : "Maximize"}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {isSupported && (
            <button
              onClick={toggleVoice}
              className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all hover:scale-105 active:scale-95"
              style={{ color: "var(--brand-strong)" }}
              aria-label={voiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all hover:scale-105 active:scale-95"
              style={{ color: "var(--brand-strong)" }}
              aria-label="Clear messages"
            >
              <Trash2 size={16} />
            </button>
          )}

          <button
            onClick={toggleChat}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all hover:scale-105 active:scale-95"
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
        className="flex-1 overflow-y-auto scrollbar-thin overflow-x-hidden bg-gradient-to-b from-transparent to-gray-50/30 dark:to-black/10 px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center px-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
              How can I help today?
            </h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
              Find furniture, compare options, or ask anything about our products.
            </p>

            <div className="grid grid-cols-1 gap-2 w-full">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(q)}
                  className="group px-3 py-2 text-left text-[13px] rounded-lg border-2 transition-all hover:scale-[1.02] active:scale-[0.98] bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm hover:shadow-md"
                  style={{
                    borderColor: "var(--brand-muted)",
                    color: "var(--brand-strong)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand-strong)";
                    e.currentTarget.style.backgroundColor = "var(--brand-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand-muted)";
                    e.currentTarget.style.backgroundColor = "";
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
      <div className="border-t border-gray-200/60 dark:border-gray-700/50 bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-sm">
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
              width="16"
              height="16"
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
            placeholder="Type your message..."
            className="flex-1 bg-transparent outline-none text-[13px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
              <Mic size={16} />
            </button>
          )}

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded-lg text-white transition-all disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed shrink-0 hover:scale-105 active:scale-95 shadow-lg disabled:shadow-none"
            style={{
              backgroundColor:
                input.trim() && !isLoading ? "var(--brand-strong)" : undefined,
              boxShadow: input.trim() && !isLoading ? "0 4px 12px rgba(237, 125, 49, 0.4)" : undefined,
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !isLoading) {
                e.currentTarget.style.backgroundColor = "var(--brand-dark)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(237, 125, 49, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (input.trim() && !isLoading) {
                e.currentTarget.style.backgroundColor = "var(--brand-strong)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(237, 125, 49, 0.4)";
              }
            }}
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
