import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    // Static export cannot optimize images at runtime
    unoptimized: true,
    remotePatterns: [],
  },
};

export default nextConfig;
