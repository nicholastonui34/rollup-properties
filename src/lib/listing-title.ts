import type { PropertyType } from "@prisma/client";
import { PROPERTY_TYPE_LABELS } from "@/lib/listing-options";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Collapses an accidental back-to-back repeat of a listing's own property-type
// label ("Bedsitter Bedsitter in South B" -> "Bedsitter in South B", "Studio
// Studio Apartment" -> "Studio Apartment"). Only touches a repeat that matches
// *this* listing's propertyType, so unrelated repeated words elsewhere in a
// title (e.g. an estate literally named "Prestige Prestige Gardens") are left
// untouched.
export function normalizeListingTitle(title: string, propertyType: PropertyType): string {
  const label = PROPERTY_TYPE_LABELS[propertyType];
  const pattern = new RegExp(`\\b(${escapeRegExp(label)})\\s+\\1\\b`, "gi");
  return title.replace(pattern, "$1").replace(/\s{2,}/g, " ").trim();
}
