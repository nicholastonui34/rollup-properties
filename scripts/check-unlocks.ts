import { prisma } from "../src/lib/prisma";
async function main() {
  const unlocks = await prisma.unlock.findMany({ include: { listing: { select: { title: true } } } });
  console.log(JSON.stringify(unlocks, null, 2));
}
main().finally(() => prisma.$disconnect());
