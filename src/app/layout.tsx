import type { Metadata, Viewport } from "next";
import "./globals.css";
import Head from "next/head";
import AuthProvider from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const metadata: Metadata = {
  title: "Ngọc Lâm Gas",
  description: "An toàn là trên hết",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/logo-192x192.png",
    apple: "/icons/logo-512x512.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <Head>
        <link rel="apple-touch-icon" href="/icons/icon-512.png" />
      </Head>
      <body className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <Toaster richColors />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
