"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

const PropertyMap = dynamic(() => import("./property-map").then((m) => m.PropertyMap), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

function MapPlaceholder() {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">
      <MapPin className="mr-2 size-4" />
      Map loading…
    </div>
  );
}

// Reserves the map's final layout height up front (no CLS) and only pulls in
// the Leaflet/Google Maps JS once the section nears the viewport — it sits
// below the fold and shouldn't compete with the photo gallery for LCP.
export function PropertyMapSection({
  lat,
  lng,
  label,
  extraMarkers,
}: {
  lat: number;
  lng: number;
  label: string;
  extraMarkers?: { lat: number; lng: number; name: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!ref.current || shouldLoad) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(ref.current);
    // Safety net for browsers/tabs where IntersectionObserver never fires
    // (e.g. a backgrounded tab) — the map still loads eventually either way.
    const fallback = setTimeout(() => setShouldLoad(true), 5000);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [shouldLoad]);

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <PropertyMap lat={lat} lng={lng} label={label} extraMarkers={extraMarkers} />
      ) : (
        <MapPlaceholder />
      )}
    </div>
  );
}
