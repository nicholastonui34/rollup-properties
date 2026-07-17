import { prisma } from "../src/lib/prisma";
async function main() {
  const listing = await prisma.listing.findUnique({ where: { slug: "test-2br-kilimani" }, include: { lister: true } });
  console.log(listing?.lister.phone, listing?.lister.name);
}
main().finally(() => prisma.$disconnect());
