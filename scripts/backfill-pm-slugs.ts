// One-off backfill for User.pmSlug (post_unlock_cta_suite) — every LISTER
// account created after this feature shipped gets a pmSlug at signup
// ((auth)/actions.ts); this fills it in for pre-existing accounts (the 12
// synthetic seed listers, and any real accounts from before this change) so
// their Apply links / microsites work without waiting on a lazy first hit.
//
// Usage (from inside rollup-properties/):
//   npx tsx --env-file=.env scripts/backfill-pm-slugs.ts --dry-run   (default; prints a report only)
//   npx tsx --env-file=.env scripts/backfill-pm-slugs.ts --apply     (writes the changes)
import { prisma } from "../src/lib/prisma";
import { slugifyPmName } from "../src/lib/pm";

async function main() {
  const apply = process.argv.includes("--apply");

  const listers = await prisma.user.findMany({
    where: { role: "LISTER", pmSlug: null },
    select: { id: true, name: true },
  });

  console.log(`Found ${listers.length} LISTER account(s) without a pmSlug.`);

  for (const lister of listers) {
    const slug = `${slugifyPmName(lister.name)}-${lister.id.slice(-4)}`;
    console.log(`${lister.id}  ${lister.name}  ->  ${slug}`);
    if (apply) {
      await prisma.user.update({ where: { id: lister.id }, data: { pmSlug: slug } });
    }
  }

  console.log(apply ? "Applied." : "Dry run only — pass --apply to write these changes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
