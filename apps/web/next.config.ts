import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages hosts this project under /RoutineChallenger.
  // Local development keeps the root path.
  ...(isGitHubPages && {
    basePath: "/RoutineChallenger",
    trailingSlash: true,
  }),
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
