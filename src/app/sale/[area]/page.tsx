import type { Metadata } from "next";
import { AreaLanding, getAreaOrNotFound } from "@/components/search/area-landing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>;
}): Promise<Metadata> {
  const { area: slug } = await params;
  const area = await getAreaOrNotFound(slug);
  return {
    title: `Homes for sale in ${area.name}, ${area.town}`,
    description: `Verified homes for sale in ${area.name}, ${area.town}. Real photos, real addresses, honest pricing.`,
  };
}

export default async function SaleAreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  return <AreaLanding areaSlug={area} purpose="SALE" />;
}
