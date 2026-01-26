'use client';

import dynamic from 'next/dynamic';

// Lazy load ChatWidget since most users won't use it
const ChatWidget = dynamic(() => import('./ChatWidget'), {
  ssr: false,
});

export default function ChatWidgetWrapper() {
  return <ChatWidget />;
}