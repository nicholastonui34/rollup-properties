// One-off migration for the "Bedsitter Bedsitter" / "Studio Studio" bug in
// listing titles AND descriptions (docs/V2_UPGRADE_BRIEF.md §13 — the same
// generator collision showed up in both fields). Collapses a back-to-back
// repeat of a listing's own propertyType label — and ONLY that: it does not
// do a naive consecutive-word dedupe, so unrelated repeated words (e.g. an
// estate actually named "Prestige Prestige Gardens") are left untouched.
//
// Mirrors the normalizer in src/lib/listing-title.ts (duplicated here, not
// imported, since scripts/ runs as plain CommonJS via tsx/esbuild — keep the
// two in sync if the rule ever changes).
//
// Usage (from inside rollup-properties/):
//   npx tsx --env-file=.env scripts/fix-duplicate-listing-titles.ts --dry-run   (default; prints a before/after report only)
//   npx tsx --env-file=.env scripts/fix-duplicate-listing-titles.ts --apply     (writes the changes)
import { PrismaClient, type PropertyType } from "@prisma/client";

const prisma = new PrismaClient();

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeDuplicateType(text: string, propertyType: PropertyType): string {
  const label = PROPERTY_TYPE_LABELS[propertyType];
  const pattern = new RegExp(`\\b(${escapeRegExp(label)})\\s+\\1\\b`, "gi");
  return text.replace(pattern, "$1").replace(/\s{2,}/g, " ").trim();
}

async function main() {
  const apply = process.argv.includes("--apply");

  const listings = await prisma.listing.findMany({
    select: { id: true, title: true, description: true, propertyType: true },
  });

  const changes = listings
    .map((l) => ({
      id: l.id,
      propertyType: l.propertyType,
      title: l.title,
      newTitle: normalizeDuplicateType(l.title, l.propertyType),
      description: l.description,
      newDescription: normalizeDuplicateType(l.description, l.propertyType),
    }))
    .filter((l) => l.newTitle !== l.title || l.newDescription !== l.description);

  if (changes.length === 0) {
    console.log("No listing titles or descriptions need fixing.");
    return;
  }

  console.log(`${apply ? "Applying" : "[DRY RUN] Would apply"} ${changes.length} fix(es):\n`);
  for (const c of changes) {
    if (c.newTitle !== c.title) console.log(`  ${c.id}  title: "${c.title}"  ->  "${c.newTitle}"`);
    if (c.newDescription !== c.description) {
      console.log(`  ${c.id}  description: "${c.description}"  ->  "${c.newDescription}"`);
    }
  }

  if (!apply) {
    console.log("\nRe-run with --apply to write these changes.");
    return;
  }

  for (const c of changes) {
    await prisma.listing.update({
      where: { id: c.id },
      data: { title: c.newTitle, description: c.newDescription },
    });
  }
  console.log(`\nUpdated ${changes.length} listing(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
