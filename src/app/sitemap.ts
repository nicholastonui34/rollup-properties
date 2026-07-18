import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [areas, listings] = await Promise.all([
    prisma.area.findMany({ select: { slug: true } }),
    prisma.listing.findMany({
      where: { status: "LIVE" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/refund-policy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const areaPages: MetadataRoute.Sitemap = areas.flatMap((area) => [
    { url: `${SITE_URL}/rent/${area.slug}`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/sale/${area.slug}`, changeFrequency: "daily", priority: 0.7 },
  ]);

  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${SITE_URL}/listings/${listing.slug}`,
    lastModified: listing.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...areaPages, ...listingPages];
}
