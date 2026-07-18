import type { Metadata } from "next";
import { AreaLanding, getAreaOrNotFound } from "@/components/search/area-landing";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>;
}): Promise<Metadata> {
  const { area: slug } = await params;
  const area = await getAreaOrNotFound(slug);
  const title = `Homes for sale in ${area.name}, ${area.town}`;
  const description = `Verified homes for sale in ${area.name}, ${area.town}. Real photos, real addresses, honest pricing.`;
  return {
    title,
    description,
    alternates: { canonical: `/sale/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/sale/${slug}` },
    twitter: { title, description },
  };
}

export default async function SaleAreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  return <AreaLanding areaSlug={area} purpose="SALE" />;
}
