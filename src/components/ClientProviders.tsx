"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/provider/ToastProvider";
import ReactQueryProvider from "@/provider/ReactQueryProvider";
import ChatWidgetWrapper from "@/components/chat/ChatWidgetWrapper";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <ToastProvider />
        <ChatWidgetWrapper />
        {children}
      </AuthProvider>
    </ReactQueryProvider>
  );
}
