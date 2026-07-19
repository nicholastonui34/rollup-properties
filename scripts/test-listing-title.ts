// Lightweight assertion checks for src/lib/listing-title.ts (docs/V2_UPGRADE_BRIEF.md §13).
// No test runner is set up in this project yet, so this mirrors the tsx-script
// convention used elsewhere in scripts/ rather than adding a new dependency.
//
// Run from inside rollup-properties/: npx tsx scripts/test-listing-title.ts
import assert from "node:assert/strict";
import type { PropertyType } from "@prisma/client";
import { normalizeListingTitle } from "@/lib/listing-title";

function check(title: string, propertyType: PropertyType, expected: string) {
  const actual = normalizeListingTitle(title, propertyType);
  assert.equal(actual, expected, `normalizeListingTitle(${JSON.stringify(title)}, ${propertyType}) => ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}

check("Bedsitter Bedsitter in South B", "BEDSITTER", "Bedsitter in South B");
check("Studio Studio Apartment in Kilimani", "STUDIO", "Studio Apartment in Kilimani");
check("Cozy 2 Bedroom Apartment in Runda", "APARTMENT", "Cozy 2 Bedroom Apartment in Runda");
// Repeated word unrelated to the propertyType (an estate literally named
// "Prestige Prestige Gardens") must NOT be touched.
check("Prestige Prestige Gardens 2 Bedroom Apartment in Runda", "APARTMENT", "Prestige Prestige Gardens 2 Bedroom Apartment in Runda");
// Case-insensitive match.
check("bedsitter Bedsitter near Yaya", "BEDSITTER", "bedsitter near Yaya");

console.log("All listing-title tests passed.");
