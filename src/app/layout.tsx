import type { Metadata, Viewport } from "next";
import "./globals.css";
import Head from "next/head";
import AuthProvider from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import localFont from "next/font/local";

const geistSans = localFont({
  src: [
    {
      path: "../../public/fonts/Geist-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Geist-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Geist-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: [
    {
      path: "../../public/fonts/GeistMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeistMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeistMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ngọc Lâm Gas",
  description: "An toàn là trên hết",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png", // Fallback browser tab icon
    apple: "/icons/icon-512.png", // iOS homescreen icon
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
    <html lang="en">
      <Head>
        {/* Safari iOS specific */}
        <link rel="apple-touch-icon" href="/icons/icon-512.png" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`}
      >
        <Toaster richColors />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
