"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { ListingCardData } from "@/lib/search";

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="background:#2f5d4f;color:#fff;border-radius:9999px;padding:4px 8px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.35);border:2px solid #fff;">%LABEL%</div>`,
  iconSize: [1, 1],
  iconAnchor: [0, 0],
});

function priceLabel(listing: ListingCardData) {
  const value =
    listing.priceKes >= 1_000_000
      ? `${(listing.priceKes / 1_000_000).toFixed(1)}M`
      : `${Math.round(listing.priceKes / 1000)}K`;
  return `KES ${value}`;
}

export function LeafletMap({ listings }: { listings: ListingCardData[] }) {
  const points = listings.filter(
    (l): l is ListingCardData & { lat: number; lng: number } => l.lat != null && l.lng != null
  );

  const center: [number, number] =
    points.length > 0 ? [points[0].lat, points[0].lng] : [-1.286389, 36.817223]; // Nairobi fallback

  return (
    <MapContainer center={center} zoom={points.length > 0 ? 12 : 11} scrollWheelZoom className="size-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.lat, listing.lng]}
          icon={L.divIcon({
            ...markerIcon.options,
            html: (markerIcon.options.html as string).replace("%LABEL%", priceLabel(listing)),
          })}
        >
          <Popup>
            <Link href={`/listings/${listing.slug}`} className="font-medium text-primary underline-offset-2 hover:underline">
              {listing.title}
            </Link>
            <div className="mt-1 text-xs text-muted-foreground">
              KES {listing.priceKes.toLocaleString()}
              {listing.purpose === "RENT" ? " /month" : ""}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
