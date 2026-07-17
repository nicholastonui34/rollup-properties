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
    title: `Rentals in ${area.name}, ${area.town}`,
    description: `Verified rental homes in ${area.name}, ${area.town}. Real photos, real addresses, no broker fees.`,
  };
}

export default async function RentAreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  return <AreaLanding areaSlug={area} purpose="RENT" />;
}
