// @ts-ignore: allow side-effect css import without type declarations
import './globals.css';
import Providers from '@/context/Providers';
import ToastProvider from '@/provider/ToastProvider';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ReactQueryProvider from '@/provider/ReactQueryProvider';
import ChatWidgetWrapper from '@/components/chat/ChatWidgetWrapper';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import { NavigationLoaderBar } from '@/components/NavigationLoader/NavigationLoaderBar';
import { NavigationLoaderProvider } from '@/components/NavigationLoader/NavigationLoaderProvider';
import { ThemeProvider } from '@/provider/ThemeProvider';
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'], // Reduced font weights to minimize preloading
  variable: '--font-body',
  display: 'swap', // Add font-display: swap for better performance
  preload: true, // Explicitly enable preloading
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className={`bg-gray-50 dark:bg-[#0f1419] text-gray-900 dark:text-gray-100 font-sans`} style={{ fontFamily: 'var(--font-body), Inter, system-ui, -apple-system, sans-serif' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div>
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center h-full bg-white dark:bg-gray-900" />
              }
            >
              <ReactQueryProvider>
                <NavigationLoaderBar />
                <NavigationLoaderProvider>
                  <Providers>
                    <ChatWidgetWrapper />
                    <ToastProvider />
                    <Header />
                    <div className="max-w-425 min-h-screen mx-auto w-full">
                      <main>{children}</main>
                    </div>
                    <Footer /> {/* ✅ MUST BE HERE */}
                  </Providers>
                </NavigationLoaderProvider>
              </ReactQueryProvider>
            </Suspense>

            <SpeedInsights />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}