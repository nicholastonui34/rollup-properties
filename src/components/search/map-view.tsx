"use client";

import dynamic from "next/dynamic";
import type { ListingCardData } from "@/lib/search";

const LeafletMap = dynamic(() => import("./leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export function MapView({ listings }: { listings: ListingCardData[] }) {
  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-xl border">
      <LeafletMap listings={listings} />
    </div>
  );
}
