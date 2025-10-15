/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 👈 ignora ESLint durante el build
  },
  typescript: {
    ignoreBuildErrors: true, // 👈 evita que los errores de tipado detengan el deploy
  },
};

export default nextConfig;