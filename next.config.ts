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
  async headers() {
    return [
      {
        // Never let a CDN/browser cache a stale service worker — it controls
        // its own versioning via CACHE_VERSION inside public/sw.js instead.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
