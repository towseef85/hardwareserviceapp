import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone: a self-contained server bundle with only the
  // deps it actually needs. Keeps the Docker image small for VPS deploys.
  output: "standalone",
};

export default nextConfig;
