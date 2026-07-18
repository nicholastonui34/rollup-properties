import type { ListingPurpose, Prisma, PropertyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 20;

export type SortKey = "newest" | "price_asc" | "price_desc" | "verified";

export type RawSearchParams = { [key: string]: string | string[] | undefined };

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function list(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

export interface ParsedFilters {
  purpose?: ListingPurpose;
  q?: string;
  town?: string;
  areaSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: PropertyType;
  furnished: boolean;
  amenities: string[];
  sort: SortKey;
  page: number;
  view: "grid" | "map";
}

export function parseFilters(params: RawSearchParams): ParsedFilters {
  const purposeRaw = first(params.purpose);
  const purpose = purposeRaw === "RENT" || purposeRaw === "SALE" ? purposeRaw : undefined;

  const sortRaw = first(params.sort);
  const sort: SortKey =
    sortRaw === "price_asc" || sortRaw === "price_desc" || sortRaw === "verified" ? sortRaw : "newest";

  const viewRaw = first(params.view);
  const view = viewRaw === "map" ? "map" : "grid";

  const pageRaw = Number(first(params.page));
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const minPriceRaw = Number(first(params.minPrice));
  const maxPriceRaw = Number(first(params.maxPrice));
  const bedroomsRaw = Number(first(params.bedrooms));

  return {
    purpose,
    q: first(params.q)?.trim() || undefined,
    town: first(params.town)?.trim() || undefined,
    areaSlug: first(params.area)?.trim() || undefined,
    minPrice: Number.isFinite(minPriceRaw) && minPriceRaw > 0 ? minPriceRaw : undefined,
    maxPrice: Number.isFinite(maxPriceRaw) && maxPriceRaw > 0 ? maxPriceRaw : undefined,
    bedrooms: Number.isFinite(bedroomsRaw) && bedroomsRaw >= 0 && first(params.bedrooms) ? bedroomsRaw : undefined,
    propertyType: (first(params.propertyType) as PropertyType) || undefined,
    furnished: first(params.furnished) === "1",
    amenities: list(params.amenities).filter(Boolean),
    sort,
    page,
    view,
  };
}

export function buildWhere(filters: ParsedFilters): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: "LIVE" };

  if (filters.purpose) where.purpose = filters.purpose;
  if (filters.town) where.town = filters.town;
  if (filters.areaSlug) where.area = { slug: filters.areaSlug };
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.furnished) where.furnished = true;

  if (filters.minPrice || filters.maxPrice) {
    where.priceKes = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.bedrooms !== undefined) {
    where.bedrooms = filters.bedrooms >= 5 ? { gte: 5 } : filters.bedrooms;
  }

  if (filters.amenities.length > 0) {
    where.amenities = { hasEvery: filters.amenities };
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { estate: { contains: filters.q, mode: "insensitive" } },
      { town: { contains: filters.q, mode: "insensitive" } },
      { area: { name: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  return where;
}

// Featured listings lead every sort mode. featuredUntil isn't re-checked
// against "now" here (Prisma orderBy can't express that), so an expired
// feature keeps sorting first until an admin clears or renews it — an
// accepted simplification for this schema/UI scaffold (see AUDIT.md).
const FEATURED_FIRST: Prisma.ListingOrderByWithRelationInput = {
  featuredUntil: { sort: "desc", nulls: "last" },
};

function orderBy(sort: SortKey): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [FEATURED_FIRST, { priceKes: "asc" }];
    case "price_desc":
      return [FEATURED_FIRST, { priceKes: "desc" }];
    case "verified":
      return [FEATURED_FIRST, { verifiedAt: "desc" }, { createdAt: "desc" }];
    default:
      return [FEATURED_FIRST, { createdAt: "desc" }];
  }
}

export const LISTING_CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  purpose: true,
  propertyType: true,
  priceKes: true,
  town: true,
  estate: true,
  bedrooms: true,
  bathrooms: true,
  lat: true,
  lng: true,
  verifiedAt: true,
  featuredUntil: true,
  area: { select: { name: true, town: true } },
  images: { where: { isCover: true }, take: 1, select: { url: true } },
} satisfies Prisma.ListingSelect;

export type ListingCardData = Prisma.ListingGetPayload<{ select: typeof LISTING_CARD_SELECT }>;

export async function searchListings(filters: ParsedFilters) {
  const where = buildWhere(filters);
  const skip = (filters.page - 1) * PAGE_SIZE;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      select: LISTING_CARD_SELECT,
      orderBy: orderBy(filters.sort),
      skip,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
