// Geocodes a Kenyan listing address to lat/lng via OpenStreetMap's free Nominatim
// service (no API key, matches this project's existing Leaflet/OSM map stack).
// Nominatim's usage policy requires an identifying User-Agent and caps bulk
// requests at ~1/sec — respected here and by the backfill script that calls this.
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "Nyoomba/1.0 (+https://nyoomba.vercel.app; nicholastonui34@gmail.com)";

export async function geocodeAddress(parts: {
  streetAddress: string;
  estate?: string | null;
  areaName?: string | null;
  town: string;
}): Promise<{ lat: number; lng: number } | null> {
  const query = [parts.streetAddress, parts.estate, parts.areaName, parts.town, "Kenya"]
    .filter(Boolean)
    .join(", ");

  const url = `${NOMINATIM_URL}?format=json&limit=1&countrycodes=ke&q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;
    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = results[0];
    if (!first) return null;
    return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
  } catch {
    return null;
  }
}
