"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { cn } from "@/lib/utils";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:9999px;background:#2f5d4f;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const amenityIcon = L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:9999px;background:#d6ad4f;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
// Esri's free World Imagery tiles — gives us a genuine satellite view alongside
// the OSM roadmap without needing a billed Google Maps Platform key.
const SATELLITE_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SATELLITE_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community";

type Tab = "map" | "satellite" | "streetview";

let mapsScriptPromise: Promise<void> | null = null;
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== "undefined" && (window as any).google?.maps) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;
  mapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
  return mapsScriptPromise;
}

function StreetViewPane({ lat, lng }: { lat: number; lng: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.maps) return;
    new g.maps.StreetViewPanorama(ref.current, {
      position: { lat, lng },
      addressControl: false,
      fullscreenControl: true,
      motionTrackingControl: false,
    });
  }, [lat, lng]);

  return <div ref={ref} className="size-full" />;
}

export function PropertyMap({
  lat,
  lng,
  label,
  extraMarkers = [],
}: {
  lat: number;
  lng: number;
  label: string;
  extraMarkers?: { lat: number; lng: number; name: string }[];
}) {
  const [tab, setTab] = useState<Tab>("map");
  const [streetViewAvailable, setStreetViewAvailable] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;
    let cancelled = false;
    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = (window as any).google;
        const svs = new g.maps.StreetViewService();
        svs.getPanorama(
          { location: { lat, lng }, radius: 100 },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (_data: any, status: string) => {
            if (!cancelled && status === "OK") setStreetViewAvailable(true);
          }
        );
      })
      .catch(() => {
        // No Street View tab if the script fails to load — never show a broken pane.
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "map", label: "Map" },
    { id: "satellite", label: "Satellite" },
    ...(streetViewAvailable ? ([{ id: "streetview", label: "Street View" }] as const) : []),
  ];

  return (
    <div>
      <div className="mb-2 flex gap-1 rounded-lg bg-muted p-1 text-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 font-medium transition-colors",
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="aspect-video w-full overflow-hidden rounded-xl border border-border">
        {tab === "streetview" ? (
          <StreetViewPane lat={lat} lng={lng} />
        ) : (
          <MapContainer
            center={[lat, lng]}
            zoom={extraMarkers.length > 0 ? 13 : 15}
            scrollWheelZoom={false}
            className="size-full"
          >
            <TileLayer
              attribution={tab === "satellite" ? SATELLITE_ATTRIBUTION : OSM_ATTRIBUTION}
              url={tab === "satellite" ? SATELLITE_TILE_URL : OSM_TILE_URL}
            />
            <Marker position={[lat, lng]} icon={pinIcon} title={label} />
            {extraMarkers.map((m, i) => (
              <Marker key={i} position={[m.lat, m.lng]} icon={amenityIcon}>
                <Popup>{m.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
