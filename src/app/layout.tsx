import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import { InstallPromptProvider } from "@/components/context/installPromptContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ngọc Lâm Gas",
  description: "An toàn là trên hết",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png", // Fallback browser tab icon
    apple: "/icons/icon-180.png", // iOS homescreen icon
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <InstallPromptProvider>{children}</InstallPromptProvider>
      </body>
    </html>
  );
}
