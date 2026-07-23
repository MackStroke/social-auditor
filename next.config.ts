import type { NextConfig } from "next";

// @ts-ignore - Next.js 16 types are missing this top-level property
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  allowedDevOrigins: ["localhost:3000", "192.168.1.42:3000"],
};

export default nextConfig;
