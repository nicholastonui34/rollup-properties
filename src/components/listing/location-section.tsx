"use client";

import { useState } from "react";
import { PropertyMapSection } from "@/components/listing/property-map-section";
import { NearbyAmenities } from "@/components/listing/nearby-amenities";
import type { AmenitiesSnapshot } from "@/lib/places";

export function LocationSection({
  lat,
  lng,
  label,
  amenities,
}: {
  lat: number;
  lng: number;
  label: string;
  amenities: AmenitiesSnapshot | null;
}) {
  const categories = amenities?.categories ?? [];
  const [activeKey, setActiveKey] = useState(categories[0]?.key ?? "");
  const activeCategory = categories.find((c) => c.key === activeKey);

  return (
    <div className="space-y-4">
      <PropertyMapSection
        lat={lat}
        lng={lng}
        label={label}
        extraMarkers={activeCategory?.items.map((i) => ({ lat: i.lat, lng: i.lng, name: i.name }))}
      />
      {categories.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">What&apos;s nearby</h3>
          <NearbyAmenities categories={categories} activeKey={activeKey || categories[0].key} onSelectCategory={setActiveKey} />
        </div>
      )}
    </div>
  );
}
