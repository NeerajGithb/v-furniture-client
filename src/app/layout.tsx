import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { NavigationLoaderBar } from "@/components/NavigationLoader/NavigationLoaderBar";
import { NavigationLoaderProvider } from "@/components/NavigationLoader/NavigationLoaderProvider";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});

export const metadata = {
  title: "Your E-commerce Store",
  description: "Modern e-commerce experience with great products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${inter.className} bg-gray-50 dark:bg-[#0f1419] text-gray-900 dark:text-gray-100`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientProviders>
            <NavigationLoaderBar />
            <Suspense fallback={null}>
              <NavigationLoaderProvider>
                <Header />
                <div className="max-w-425 min-h-screen mx-auto w-full">
                  <main>{children}</main>
                </div>
                <Footer />
              </NavigationLoaderProvider>
            </Suspense>
            <SpeedInsights />
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
