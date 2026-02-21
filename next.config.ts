import type { NextConfig } from "next";
import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});
const r2Url = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;

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
        ]
      : [],
  },
};

export default withPWA(nextConfig);
