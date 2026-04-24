import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Каталог приложения (apps/frontend). При нескольких lockfile в монорепо Next
 * иначе выбирает корень выше и ломает резолв `@import "tailwindcss"` (ищет в `apps/`).
 */
const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Vercel sets `outputFileTracingRoot` for monorepos; Next requires it to match
  // `turbopack.root`, otherwise Turbopack can resolve native deps incorrectly.
  outputFileTracingRoot: appDir,
  turbopack: {
    root: appDir,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [{ source: "/calculator", destination: "/assets/calculator", permanent: true }];
  },
};

export default nextConfig;
