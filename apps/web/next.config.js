/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://localhost:3000'],
  transpilePackages: ['@repo/ui', '@repo/components', '@repo/schema'],
};

export default nextConfig;
