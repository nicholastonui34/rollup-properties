import { prisma } from "@/lib/prisma";

// Shared by the Paystack redirect callback and the webhook — either can arrive
// first, so this must be idempotent (a SUCCESS payment or an existing Unlock
// row means the work is already done).
export async function finalizeSuccessfulPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || !payment.listingId) return;
  if (payment.status === "SUCCESS") return;

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } }),
    prisma.unlock.upsert({
      where: { userId_listingId: { userId: payment.userId, listingId: payment.listingId } },
      update: { paymentId: payment.id },
      create: { userId: payment.userId, listingId: payment.listingId, paymentId: payment.id },
    }),
  ]);
}
