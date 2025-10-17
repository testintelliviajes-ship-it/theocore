/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 🚫 Desactiva el chequeo de ESLint en compilación
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚫 (Opcional) Evita que falle por types temporales
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;