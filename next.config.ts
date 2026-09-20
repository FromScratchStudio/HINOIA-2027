import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow all local assets; add remote patterns here if needed
    unoptimized: false,
    remotePatterns: [],
  },
};

export default nextConfig;
