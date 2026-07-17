import type { ListingStatus, PropertyType } from "@prisma/client";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  BEDSITTER: "Bedsitter",
  STUDIO: "Studio",
  APARTMENT: "Apartment",
  MAISONETTE: "Maisonette",
  BUNGALOW: "Bungalow",
  TOWNHOUSE: "Townhouse",
  COMMERCIAL: "Commercial",
  LAND: "Land",
};

export const AMENITIES = [
  "Parking",
  "Borehole / water",
  "Backup generator",
  "Lift",
  "Gym",
  "Pool",
  "Gated",
  "CCTV",
  "Fibre ready",
  "Balcony",
  "DSQ",
] as const;

export const MIN_LISTING_PHOTOS = 5;

// KES 99 launch price (BRIEF.md §5) — impulse-priced, well under typical broker viewing fees.
export const UNLOCK_PRICE_KES = 99;

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  IN_VERIFICATION: "In verification",
  NEEDS_INFO: "Needs info",
  REJECTED: "Rejected",
  LIVE: "Live",
  TAKEN: "Taken",
  EXPIRED: "Expired",
  SUSPENDED: "Suspended",
};

export const LISTING_STATUS_BADGE_VARIANT: Record<
  ListingStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  SUBMITTED: "secondary",
  IN_VERIFICATION: "secondary",
  NEEDS_INFO: "destructive",
  REJECTED: "destructive",
  LIVE: "default",
  TAKEN: "outline",
  EXPIRED: "outline",
  SUSPENDED: "destructive",
};
