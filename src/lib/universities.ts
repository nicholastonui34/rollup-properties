import { distanceKm } from "@/lib/distance";

export interface University {
  slug: string;
  name: string;
  lat: number;
  lng: number;
}

// Nairobi-area universities only at launch — matches where real/test
// listing inventory actually exists (BRIEF.md Student Housing Hub).
export const UNIVERSITIES: University[] = [
  { slug: "uon", name: "University of Nairobi (Main Campus)", lat: -1.2795, lng: 36.8172 },
  { slug: "ku", name: "Kenyatta University", lat: -1.1809, lng: 36.9339 },
  { slug: "strathmore", name: "Strathmore University", lat: -1.3095, lng: 36.8121 },
  { slug: "jkuat", name: "JKUAT (Juja)", lat: -1.0956, lng: 37.0141 },
  { slug: "usiu", name: "USIU-Africa", lat: -1.2197, lng: 36.8783 },
  { slug: "mmu", name: "Multimedia University of Kenya", lat: -1.3826, lng: 36.7355 },
];

export function findUniversity(slug: string | undefined): University | undefined {
  return UNIVERSITIES.find((u) => u.slug === slug);
}

// Radius within which a listing counts as "near campus" for the Student
// Housing Hub filter.
export const CAMPUS_RADIUS_KM = 10;

// Tighter radius for the auto cross-link banner on a listing's own detail
// page (V2 §4.4) — distinct from the broader Hub search-filter radius above.
export const CROSS_LINK_RADIUS_KM = 3;

export function nearestUniversityWithin(lat: number, lng: number, radiusKm: number): University | null {
  let best: University | null = null;
  let bestDistance = Infinity;
  for (const u of UNIVERSITIES) {
    const d = distanceKm(lat, lng, u.lat, u.lng);
    if (d <= radiusKm && d < bestDistance) {
      best = u;
      bestDistance = d;
    }
  }
  return best;
}
