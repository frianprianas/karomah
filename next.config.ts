import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Melewati pengecekan TypeScript dan ESLint saat build agar lebih cepat dan hemat RAM
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
