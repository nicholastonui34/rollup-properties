import type {
  ListingPurpose,
  ListingStatus,
  MediaRequestStatus,
  PropertyType,
  ReportStatus,
  TourRequestStatus,
  TourTimeSlot,
  TourType,
} from "@prisma/client";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  BEDSITTER: "Bedsitter",
  STUDIO: "Studio",
  APARTMENT: "Apartment",
  MAISONETTE: "Maisonette",
  BUNGALOW: "Bungalow",
  TOWNHOUSE: "Townhouse",
  COMMERCIAL: "Commercial",
  LAND: "Land",
  HOSTEL: "Hostel",
  SHARED_APARTMENT: "Shared apartment",
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
  "Wi-Fi included",
  "Flexible move-in",
] as const;

export const MIN_LISTING_PHOTOS = 5;
export const MAX_LISTING_PHOTOS = 30;
// Soft nudge shown in the uploader below this count (V2 §2) — not enforced, just copy.
export const STRONG_LISTING_PHOTO_COUNT = 8;

// KES 99 launch price (BRIEF.md §5) — impulse-priced, well under typical broker viewing fees.
export const UNLOCK_PRICE_KES = 99;

// V2 §14.1 — first 20 published listings per lister are free; #21 onward costs this.
export const FREE_LISTING_QUOTA = 20;
export const LISTING_PUBLISH_FEE_KES = 99;

// V2 §14.2 — Pro Media Services. Pricing is placeholder ("from KES —") until
// the team sets a real price list; services list is what the request form offers.
export const PRO_MEDIA_SERVICES = [
  "Professional photography",
  "Video tour",
  "3D / virtual tour",
  "Other listing enhancement",
] as const;

export const MEDIA_REQUEST_STATUS_LABELS: Record<MediaRequestStatus, string> = {
  NEW: "New",
  SCHEDULED: "Scheduled",
  DELIVERED: "Delivered",
};

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

// TAKEN covers both "rented" and "sold" — the label is purpose-aware so a
// tenant listing reads "Rented" and a sale listing reads "Sold" everywhere
// the status is shown, without splitting the DB enum in two.
export function listingStatusLabel(status: ListingStatus, purpose: ListingPurpose): string {
  if (status === "TAKEN") return purpose === "SALE" ? "Sold" : "Rented";
  return LISTING_STATUS_LABELS[status];
}

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

export const REPORT_REASONS = [
  "Listing looks fake or is a scam",
  "Photos don't match the property",
  "Already rented / sold",
  "Wrong price or location",
  "Manager unreachable after unlock",
  "Other",
] as const;

// A listing gets pulled from public view automatically once this many
// open reports pile up — protects seekers while a human reviews it.
export const REPORT_AUTO_SUSPEND_THRESHOLD = 3;

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  OPEN: "Reported",
  INVESTIGATING: "Investigating",
  REFUNDED: "Refunded",
  REJECTED: "Rejected",
};

export const REPORT_STATUS_BADGE_VARIANT: Record<
  ReportStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  OPEN: "destructive",
  INVESTIGATING: "secondary",
  REFUNDED: "default",
  REJECTED: "outline",
};

// Freshness staleness cue on listing cards/detail — amber past this many
// days since last confirmation (half the admin 60-day re-verification flag).
export const STALE_AFTER_DAYS = 45;

export const TOUR_TIME_SLOT_LABELS: Record<TourTimeSlot, string> = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
};

export const TOUR_TYPE_LABELS: Record<TourType, string> = {
  IN_PERSON: "In-person",
  VIDEO_CALL: "Video call",
};

export const TOUR_REQUEST_STATUS_LABELS: Record<TourRequestStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const TOUR_REQUEST_STATUS_BADGE_VARIANT: Record<
  TourRequestStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
};
