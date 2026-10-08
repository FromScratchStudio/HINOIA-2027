import type { NextConfig } from "next";

const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const githubRepository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const inferredBasePath =
  process.env.GITHUB_ACTIONS === "true" && githubRepository
    ? `/${githubRepository}`
    : "";
const basePath = configuredBasePath || inferredBasePath;

const nextConfig: NextConfig = {
  output: "export",
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
