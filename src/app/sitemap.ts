import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { CAREER_ROLES } from "@/lib/careers";
import { NEWS_ARTICLES } from "@/lib/news";

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
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/careers`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${SITE_URL}/news`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/help`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/advertise`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/refund-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/applicant-privacy-notice`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const careerPages: MetadataRoute.Sitemap = CAREER_ROLES.map((role) => ({
    url: `${SITE_URL}/careers/${role.slug}`,
    changeFrequency: "weekly",
    priority: 0.3,
  }));

  const newsPages: MetadataRoute.Sitemap = NEWS_ARTICLES.map((article) => ({
    url: `${SITE_URL}/news/${article.slug}`,
    lastModified: article.publishedAt,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

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

  return [...staticPages, ...careerPages, ...newsPages, ...areaPages, ...listingPages];
}
