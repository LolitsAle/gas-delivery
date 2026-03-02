import type { NextConfig } from "next";
import nextPWA from "next-pwa";

const r2Url = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  clientsClaim: true,

  disable: process.env.NODE_ENV === "development",

  // ✅ IMPORTANT: never cache API calls
  runtimeCaching: [
    {
      urlPattern: /^https?.*\/api\/.*$/i,
      handler: "NetworkOnly",
      method: "GET",
    },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: r2Url
      ? [
          {
            protocol: "https",
            hostname: new URL(r2Url).hostname,
            pathname: "/**",
          },
          {
            protocol: "https",
            hostname: "img.gasngoc.com",
            pathname: "/**",
          },
        ]
      : [],
  },
};

export default withPWA(nextConfig);
