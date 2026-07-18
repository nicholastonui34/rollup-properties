// Removes exactly the fixture data created by scripts/seed-nairobi-listings.ts,
// using the manifest it wrote — never touches real listings or accounts.
//
// Run from inside rollup-properties/: npx tsx --env-file=.env scripts/clear-nairobi-listings.ts
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const MANIFEST_PATH = join(process.cwd(), "scripts", "seed-nairobi-listings-manifest.json");

async function main() {
  if (!existsSync(MANIFEST_PATH)) {
    console.log("No manifest found at scripts/seed-nairobi-listings-manifest.json — nothing to clear.");
    return;
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as {
    listingIds: string[];
    listerIds: string[];
  };

  const { count: deletedListings } = await prisma.listing.deleteMany({
    where: { id: { in: manifest.listingIds } },
  });
  console.log(`Deleted ${deletedListings} listings (and their images/verifications via cascade).`);

  // Only remove a seeded lister if none of their listings survived deletion
  // (e.g. a real listing was later attached to the same test account).
  let deletedListers = 0;
  for (const listerId of manifest.listerIds) {
    const remaining = await prisma.listing.count({ where: { listerId } });
    if (remaining === 0) {
      await prisma.user.delete({ where: { id: listerId } }).catch(() => {});
      deletedListers++;
    }
  }
  console.log(`Deleted ${deletedListers} test lister accounts.`);

  unlinkSync(MANIFEST_PATH);
  console.log("Removed manifest file.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
