import { prisma } from "../src/lib/prisma";
async function main() {
  const del = await prisma.unlock.deleteMany({ where: { userId: "cmrowekvt0001sy5o4ow21958" } });
  console.log("deleted unlocks:", del.count);
}
main().finally(() => prisma.$disconnect());
