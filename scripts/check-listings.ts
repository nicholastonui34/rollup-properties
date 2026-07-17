import { prisma } from "../src/lib/prisma";

async function main() {
  const listings = await prisma.listing.findMany({
    select: { id: true, slug: true, title: true, status: true, listerId: true },
  });
  console.log(JSON.stringify(listings, null, 2));
  const users = await prisma.user.findMany({ select: { id: true, name: true, role: true, phone: true } });
  console.log(JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
