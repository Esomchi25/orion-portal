/**
 * Next.js Configuration
 * @governance COMPONENT-001
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  // Proxy API requests to ORION backend
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: process.env.ORION_API_URL || 'http://localhost:8001/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
