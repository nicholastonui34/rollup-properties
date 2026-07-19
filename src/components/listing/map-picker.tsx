"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#2f5d4f;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const NAIROBI_CENTER: [number, number] = [-1.286389, 36.817223];

function ClickCapture({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const center: [number, number] = lat != null && lng != null ? [lat, lng] : NAIROBI_CENTER;

  return (
    <MapContainer center={center} zoom={lat != null ? 14 : 11} scrollWheelZoom className="size-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickCapture onPick={onChange} />
      {lat != null && lng != null && <Marker position={[lat, lng]} icon={pinIcon} />}
    </MapContainer>
  );
}
