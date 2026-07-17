import { prisma } from "../src/lib/prisma";
import { finalizeSuccessfulPayment } from "../src/lib/unlock";

async function main() {
  const payment = await prisma.payment.findFirst({ where: { providerRef: "unlock_5b256e31bb43948efff0" } });
  if (!payment) throw new Error("payment not found");

  await finalizeSuccessfulPayment(payment.id);

  const updated = await prisma.payment.findUnique({ where: { id: payment.id } });
  const unlock = await prisma.unlock.findFirst({ where: { paymentId: payment.id } });
  console.log("payment status:", updated?.status);
  console.log("unlock:", JSON.stringify(unlock, null, 2));

  // idempotency check — call again, should be a no-op
  await finalizeSuccessfulPayment(payment.id);
  const unlockCountAfter = await prisma.unlock.count({ where: { userId: payment.userId, listingId: payment.listingId! } });
  console.log("unlock rows for user+listing after re-run (should be 1):", unlockCountAfter);
}

main().finally(() => prisma.$disconnect());
