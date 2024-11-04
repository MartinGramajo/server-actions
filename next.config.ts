import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'tailus.io',
      },
      {
        protocol: "https",
        hostname: 'res.cloudinary.com',
      },

    ],
  }
};

export default nextConfig;
