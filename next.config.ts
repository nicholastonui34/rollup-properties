import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Test/seed listing photos only (scripts/seed-nairobi-listings.ts) — remove once real
      // Cloudinary-hosted listing photos replace the seed fixtures before launch.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
