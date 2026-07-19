// Backfills lat/lng for listings that have neither a manually-dropped pin nor
// a prior auto-geocode (docs/V2_UPGRADE_BRIEF.md §1). Uses the same free
// Nominatim geocoder as src/lib/geocoding.ts, throttled to ~1 request/sec per
// Nominatim's usage policy — do not remove the delay or run this in parallel.
//
// Usage (from inside rollup-properties/):
//   npx tsx --env-file=.env scripts/backfill-listing-geocoding.ts --dry-run   (default; reports only)
//   npx tsx --env-file=.env scripts/backfill-listing-geocoding.ts --apply
import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "../src/lib/geocoding";

const prisma = new PrismaClient();
const DELAY_MS = 1100;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const apply = process.argv.includes("--apply");

  const listings = await prisma.listing.findMany({
    where: { lat: null },
    select: {
      id: true,
      streetAddress: true,
      estate: true,
      town: true,
      area: { select: { name: true } },
    },
  });

  if (listings.length === 0) {
    console.log("No listings are missing coordinates.");
    return;
  }

  console.log(`${apply ? "Geocoding" : "[DRY RUN] Would geocode"} ${listings.length} listing(s)...\n`);

  let geocoded = 0;
  let failed = 0;
  for (const listing of listings) {
    const geo = await geocodeAddress({
      streetAddress: listing.streetAddress,
      estate: listing.estate,
      areaName: listing.area?.name,
      town: listing.town,
    });

    if (!geo) {
      console.log(`  ${listing.id}  no match for "${listing.streetAddress}, ${listing.estate ?? listing.area?.name ?? listing.town}"`);
      failed++;
    } else {
      console.log(`  ${listing.id}  -> ${geo.lat}, ${geo.lng}`);
      geocoded++;
      if (apply) {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { lat: geo.lat, lng: geo.lng, geocodedAt: new Date() },
        });
      }
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n${apply ? "Updated" : "Would update"} ${geocoded} listing(s); ${failed} had no geocoding match.`);
  if (!apply) console.log("Re-run with --apply to write these changes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
