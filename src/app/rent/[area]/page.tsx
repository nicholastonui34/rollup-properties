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
  const title = `Rentals in ${area.name}, ${area.town}`;
  const description = `Verified rental homes in ${area.name}, ${area.town}. Real photos, real addresses, no broker fees.`;
  return {
    title,
    description,
    alternates: { canonical: `/rent/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/rent/${slug}` },
    twitter: { title, description },
  };
}

export default async function RentAreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  return <AreaLanding areaSlug={area} purpose="RENT" />;
}
