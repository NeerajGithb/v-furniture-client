"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/provider/ToastProvider";
import ReactQueryProvider from "@/provider/ReactQueryProvider";
import ChatWidgetWrapper from "@/components/chat/ChatWidgetWrapper";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore } from "@/stores/authStore";

function GlobalAuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuthStore();
  return <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />;
}

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <ToastProvider />
        <ChatWidgetWrapper />
        <GlobalAuthModal />
        {children}
      </AuthProvider>
    </ReactQueryProvider>
  );
}
