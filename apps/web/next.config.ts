import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  reactStrictMode: true,
  transpilePackages: ["@aiyomi/analytics", "@aiyomi/config", "@aiyomi/schemas"],
};

export default nextConfig;
