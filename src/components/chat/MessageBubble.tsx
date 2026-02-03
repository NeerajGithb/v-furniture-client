"use client";

import { Message, useChatStore } from "@/stores/chatStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoArrowUndo } from "react-icons/io5";
import ProductRail from "../product/ProductRail";
import StructuredProductCard from "./StructuredProductCard";
import { useNavigate } from "../NavigationLoader";

interface MessageBubbleProps {
  message: Message;
  onContentChange?: () => void;
  isLastMessage?: boolean;
}

export default function MessageBubble({
  message,
  onContentChange,
  isLastMessage = false,
}: MessageBubbleProps) {
  const navigate = useNavigate();
  const revertLastMessage = useChatStore((s) => s.revertLastMessage);

  const isUser = message.role === "user";
  const shouldAnimate = message.isNew && !isUser;
  const isLoading = message.isLoading || false;

  const hasProducts = !!message.products?.length;
  const shouldRenderProducts = message.shouldRenderProducts;
  const hasCategories = !!message.categories?.length;
  const hasNavigation = !!message.navigationUrl;
  const hasStructuredData = !!message.structuredData;

  const [displayedText, setDisplayedText] = useState(
    shouldAnimate ? "" : message.content,
  );

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(message.content);
      onContentChange?.();
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < message.content.length) {
        setDisplayedText(message.content.slice(0, index + 1));
        index++;
        onContentChange?.();
      } else {
        clearInterval(interval);
      }
    }, 14);

    return () => clearInterval(interval);
  }, [message.content, shouldAnimate, onContentChange]);

  const formatRegularText = (text: string) => {
    let formatted = text;
    formatted = formatted.replace(/\*\*/g, "");
    formatted = formatted.replace(/•\s*/g, "");
    formatted = formatted.replace(
      /([₹$€£¥₽])\s*([\d,]+)/g,
      '<span class="font-bold whitespace-nowrap" style="color: var(--brand-strong)">$1$2</span>',
    );
    return formatted.trim();
  };

  const cleanText = displayedText.replace(/\s+/g, " ").trim();
  const animateStructuredCard = shouldAnimate && displayedText.length > 10;

  return (
    <div
      className={`w-full mb-3 flex flex-col ${isUser ? "items-end" : "items-start"}`}
    >
      {!isUser && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 ml-1">
          Haven
        </p>
      )}

      {/* ---------- CATEGORIES ---------- */}
      {hasCategories && (
        <div className="w-full mb-2 flex flex-wrap gap-2">
          {message.categories!.slice(0, 6).map((category: any) => (
            <button
              key={category._id}
              onClick={() => navigate.push(`/categories/${category.slug}`)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border text-xs font-medium rounded"
              style={{
                borderColor: "var(--brand-muted)",
                color: "var(--brand-strong)",
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* ---------- PRODUCT RAIL ---------- */}
      {hasProducts && shouldRenderProducts && (
        <div className="w-full mb-3">
          <ProductRail products={message.products!} />
        </div>
      )}

      {/* ---------- STRUCTURED PRODUCT CARD ---------- */}
      {hasStructuredData && (
        <div className="w-full mb-3">
          <StructuredProductCard
            data={message.structuredData}
            animate={animateStructuredCard}
          />
        </div>
      )}

      {/* ---------- CHAT BUBBLE ---------- */}
      <div className={`${isUser ? "max-w-[78%]" : "max-w-[75%]"}`}>
        <div
          className={`
            px-4 py-3 text-[13px] leading-tight min-h-10
            ${
              isUser
                ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl rounded-br-sm"
                : "bg-linear-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <div className="flex-1">
              {isUser ? (
                <div className="whitespace-pre-wrap">{cleanText}</div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatRegularText(cleanText),
                  }}
                  className="whitespace-pre-wrap"
                />
              )}
            </div>

            {/* ---------- LOADER ---------- */}
            {isLoading && (
              <div className="shrink-0">
                <svg
                  className="animate-spin h-4 w-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- NAVIGATION ---------- */}
      {hasNavigation && message.navigation?.message && (
        <div
          className="mt-2 px-3 py-1.5 border text-xs rounded"
          style={{
            backgroundColor: "var(--brand-text)",
            borderColor: "var(--brand-muted)",
            color: "var(--brand-strong)",
          }}
        >
          {message.navigation.message}
        </div>
      )}

      {/* ---------- UNDO ---------- */}
      {!isUser && isLastMessage && !isLoading && (
        <button
          onClick={() => revertLastMessage()}
          className="mt-1 flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <IoArrowUndo className="w-3 h-3" />
          Undo
        </button>
      )}
    </div>
  );
}
