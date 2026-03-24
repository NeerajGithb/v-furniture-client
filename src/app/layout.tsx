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
import type { Metadata } from "next";

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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://vfurnitures.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "V Furnitures – Premium Furniture Store",
    template: "%s | V Furnitures",
  },
  description:
    "Shop premium quality furniture for every room. Explore sofas, beds, dining sets, wardrobes and more at V Furnitures – crafted for comfort and style.",
  keywords: [
    "furniture",
    "buy furniture online",
    "sofa",
    "bed",
    "dining table",
    "wardrobe",
    "home decor",
    "premium furniture",
    "furniture store India",
  ],
  authors: [{ name: "V Furnitures" }],
  creator: "V Furnitures",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    siteName: "V Furnitures",
    title: "V Furnitures – Premium Furniture Store",
    description:
      "Shop premium quality furniture for every room. Explore sofas, beds, dining sets, wardrobes and more.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "V Furnitures",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "V Furnitures – Premium Furniture Store",
    description:
      "Shop premium quality furniture for every room. Explore sofas, beds, dining sets, wardrobes and more.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
      </head>
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
