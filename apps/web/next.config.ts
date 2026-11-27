import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@routine-challenger/types",
    "@routine-challenger/core",
    "@routine-challenger/data",
    "@routine-challenger/store",
    "@routine-challenger/storage",
    "@routine-challenger/ui",
  ],
};

export default nextConfig;
