import type { NextConfig } from "next";

const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const basePath = configuredBasePath ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(basePath
    ? {
        basePath,
        assetPrefix: `${basePath}/`,
      }
    : {}),
  images: {
    // Static export cannot optimize images at runtime
    unoptimized: true,
    remotePatterns: [],
  },
};

export default nextConfig;
