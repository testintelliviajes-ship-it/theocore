import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // 🚫 Desactiva ESLint en compilaciones
  },
};

export default nextConfig;