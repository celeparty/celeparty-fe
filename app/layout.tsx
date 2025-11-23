"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SessionWrapper from "@/components/SessionWrapper";
import TopHeader from "@/components/TopHeader";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Inter, Quicksand } from "next/font/google";
import Script from "next/script";
import "@/styles/globals.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const quick = Quicksand({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-quicksand",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const isProduction = process.env.PRODUCTION_MODE === "true";
  const midtransUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <SessionWrapper>
      <QueryClientProvider client={queryClient}>
        <html lang="id" className={`${inter.variable} ${quick.variable}`}>
          <head>
            <Script src={midtransUrl} data-client-key={process.env.NEXT_PUBLIC_CLIENT_KEY} />
          </head>
          <body
            className="font-inter antialiased bg-c-gray-50 min-h-screen"
            suppressHydrationWarning={true}
          >
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-c-blue text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-c-blue-light"
            >
              Lompat ke konten utama
            </a>

            <header role="banner">
              <TopHeader />
              <Header />
            </header>

            <main id="main-content" className="flex-1" role="main">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>

            <footer role="contentinfo">
              <Footer />
            </footer>

            <Toaster />
          </body>
        </html>
      </QueryClientProvider>
    </SessionWrapper>
  );
}
