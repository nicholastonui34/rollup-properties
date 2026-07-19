import { prisma } from "@/lib/prisma";

// Shared by the Paystack redirect callback and the webhook — either can arrive
// first, so this must be idempotent (a SUCCESS payment, or the listing already
// being published, means the work is already done). Dispatches on purpose:
// UNLOCK creates a contact-unlock, LISTING_FEE publishes the paid listing
// (V2 §14.1 — the over-quota payment gate).
export async function finalizeSuccessfulPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || !payment.listingId) return;
  if (payment.status === "SUCCESS") return;

  if (payment.purpose === "LISTING_FEE") {
    const listing = await prisma.listing.findUnique({ where: { id: payment.listingId } });
    if (!listing || listing.publishedAt) return;
    await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } }),
      prisma.listing.update({
        where: { id: payment.listingId },
        data: { status: "SUBMITTED", publishedAt: new Date() },
      }),
    ]);
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } }),
    prisma.unlock.upsert({
      where: { userId_listingId: { userId: payment.userId, listingId: payment.listingId } },
      update: { paymentId: payment.id },
      create: { userId: payment.userId, listingId: payment.listingId, paymentId: payment.id },
    }),
  ]);
}
