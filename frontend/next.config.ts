import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow NEXT_PUBLIC_API_URL to be set at build time via Railway env vars.
  // Falls back to localhost for local dev.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
  // Allow images from any Railway/Vercel subdomain if we ever add images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.railway.app" },
      { protocol: "https", hostname: "*.vercel.app" },
    ],
  },
};

export default nextConfig;
