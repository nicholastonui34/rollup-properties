import { prisma } from "@/lib/prisma";
import { distanceKm } from "@/lib/distance";

export type AmenityItem = {
  placeId: string;
  name: string;
  rating: number | null;
  userRatingsTotal: number | null;
  distanceKm: number;
  lat: number;
  lng: number;
};

export type AmenityCategory = {
  key: string;
  label: string;
  items: AmenityItem[];
};

export type AmenitiesSnapshot = {
  categories: AmenityCategory[];
  fetchedAt: string;
};

type PlaceQuery = { type?: string; keyword?: string };
type CategoryConfig = { key: string; label: string; radiusKm: number; queries: PlaceQuery[] };

// Category -> Google Places type/keyword mapping (docs/V2_UPGRADE_BRIEF.md §4.2).
// "Highlights" isn't fetched directly — it's curated from the pooled results below.
const CATEGORIES: CategoryConfig[] = [
  { key: "cafes", label: "Cafes", radiusKm: 1.5, queries: [{ type: "cafe" }] },
  { key: "shopping", label: "Shopping", radiusKm: 1.5, queries: [{ type: "shopping_mall" }, { type: "clothing_store" }] },
  {
    key: "arts_entertainment",
    label: "Arts and entertainment",
    radiusKm: 1.5,
    queries: [{ type: "art_gallery" }, { type: "movie_theater" }, { type: "museum" }, { type: "tourist_attraction" }],
  },
  { key: "restaurants", label: "Restaurants", radiusKm: 1.5, queries: [{ type: "restaurant" }] },
  { key: "groceries", label: "Groceries", radiusKm: 1.5, queries: [{ type: "supermarket" }, { type: "grocery_or_supermarket" }] },
  { key: "nightlife", label: "Nightlife", radiusKm: 1.5, queries: [{ type: "night_club" }, { type: "bar" }] },
  { key: "beauty_spas", label: "Beauty and spas", radiusKm: 1.5, queries: [{ type: "beauty_salon" }, { type: "spa" }] },
  { key: "active_life", label: "Active life", radiusKm: 1.5, queries: [{ type: "park" }, { type: "stadium" }] },
  { key: "fitness", label: "Fitness", radiusKm: 1.5, queries: [{ type: "gym" }] },
  {
    key: "public_transportation",
    label: "Public transportation",
    radiusKm: 1.5,
    queries: [{ type: "bus_station" }, { type: "transit_station" }, { type: "train_station" }, { keyword: "matatu stage" }],
  },
  {
    key: "hospitals_medical",
    label: "Hospitals and medical",
    radiusKm: 3,
    queries: [{ type: "hospital" }, { type: "pharmacy" }, { type: "doctor" }],
  },
  {
    key: "schools_daycare",
    label: "Kindergartens, primary schools & daycare",
    radiusKm: 1.5,
    queries: [{ type: "primary_school" }, { type: "preschool" }, { keyword: "daycare" }],
  },
  { key: "colleges_universities", label: "Colleges and universities", radiusKm: 3, queries: [{ type: "university" }] },
];

const HIGHLIGHT_MIN_RATING = 4.5;
const HIGHLIGHT_MIN_REVIEWS = 100;
const AMENITIES_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type RawPlace = {
  place_id?: string;
  name?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location?: { lat?: number; lng?: number } };
};

async function nearbySearch(lat: number, lng: number, radiusM: number, query: PlaceQuery, apiKey: string): Promise<RawPlace[]> {
  const params = new URLSearchParams({ location: `${lat},${lng}`, radius: String(radiusM), key: apiKey });
  if (query.type) params.set("type", query.type);
  if (query.keyword) params.set("keyword", query.keyword);

  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("[places] nearbysearch failed", data.status, data.error_message);
      return [];
    }
    return data.results ?? [];
  } catch (e) {
    console.error("[places] nearbysearch request failed", e);
    return [];
  }
}

// Runs every sub-query for a category, dedupes by place_id, computes distance
// from the listing, and sorts nearest-first. Returns the FULL merged list
// (not capped) — display slices to top 5, but Highlights needs the whole pool.
async function fetchCategoryPool(lat: number, lng: number, config: CategoryConfig, apiKey: string): Promise<AmenityItem[]> {
  const radiusM = config.radiusKm * 1000;
  const resultsArrays = await Promise.all(config.queries.map((q) => nearbySearch(lat, lng, radiusM, q, apiKey)));

  const merged = new Map<string, RawPlace>();
  for (const arr of resultsArrays) {
    for (const r of arr) {
      if (r.place_id) merged.set(r.place_id, r);
    }
  }

  return Array.from(merged.values())
    .filter((r) => r.place_id && r.name && r.geometry?.location?.lat != null && r.geometry.location.lng != null)
    .map((r) => ({
      placeId: r.place_id!,
      name: r.name!,
      rating: r.rating ?? null,
      userRatingsTotal: r.user_ratings_total ?? null,
      lat: r.geometry!.location!.lat!,
      lng: r.geometry!.location!.lng!,
      distanceKm: distanceKm(lat, lng, r.geometry!.location!.lat!, r.geometry!.location!.lng!),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

async function fetchAmenitiesSnapshot(lat: number, lng: number): Promise<AmenitiesSnapshot | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const perCategory = await Promise.all(
    CATEGORIES.map(async (c) => ({ key: c.key, label: c.label, pool: await fetchCategoryPool(lat, lng, c, apiKey) }))
  );

  const highlights = perCategory
    .flatMap((c) => c.pool)
    .filter((i) => (i.rating ?? 0) >= HIGHLIGHT_MIN_RATING && (i.userRatingsTotal ?? 0) >= HIGHLIGHT_MIN_REVIEWS)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.distanceKm - b.distanceKm)
    .slice(0, 5);

  const categories: AmenityCategory[] = [
    { key: "highlights", label: "Highlights", items: highlights },
    ...perCategory.map((c) => ({ key: c.key, label: c.label, items: c.pool.slice(0, 5) })),
  ].filter((c) => c.items.length > 0);

  return { categories, fetchedAt: new Date().toISOString() };
}

// Cache-first accessor called from the listing detail page. Never calls out
// to Places on every page view — only when the cached snapshot is missing or
// older than the 30-day TTL, and only if a Places API key is configured.
export async function getAmenitiesSnapshot(listing: {
  id: string;
  lat: number | null;
  lng: number | null;
  amenitiesSnapshot: unknown;
  amenitiesFetchedAt: Date | null;
}): Promise<AmenitiesSnapshot | null> {
  if (listing.lat == null || listing.lng == null) return null;

  const cached = (listing.amenitiesSnapshot as AmenitiesSnapshot | null) ?? null;
  const isFresh = listing.amenitiesFetchedAt != null && Date.now() - listing.amenitiesFetchedAt.getTime() < AMENITIES_TTL_MS;
  if (isFresh && cached) return cached;

  const fresh = await fetchAmenitiesSnapshot(listing.lat, listing.lng);
  if (!fresh) return cached;

  await prisma.listing.update({
    where: { id: listing.id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { amenitiesSnapshot: fresh as any, amenitiesFetchedAt: new Date() },
  });
  return fresh;
}
