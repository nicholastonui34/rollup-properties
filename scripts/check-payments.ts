import { prisma } from "../src/lib/prisma";

async function main() {
  const payments = await prisma.payment.findMany({
    include: { user: { select: { name: true } }, listing: { select: { title: true } } },
  });
  console.log(JSON.stringify(payments, null, 2));
}

main().finally(() => prisma.$disconnect());
