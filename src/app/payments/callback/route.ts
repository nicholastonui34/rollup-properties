import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";
import { finalizeSuccessfulPayment } from "@/lib/unlock";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference") ?? req.nextUrl.searchParams.get("trxref");
  const base = req.nextUrl.origin;
  if (!reference) return NextResponse.redirect(`${base}/`);

  const payment = await prisma.payment.findUnique({
    where: { providerRef: reference },
    include: { listing: { select: { slug: true } } },
  });
  if (!payment) return NextResponse.redirect(`${base}/`);

  const listingUrl = payment.listing ? `${base}/listings/${payment.listing.slug}` : `${base}/`;

  if (payment.status === "SUCCESS") {
    return NextResponse.redirect(`${listingUrl}?unlocked=1`);
  }

  try {
    const result = await verifyTransaction(reference);
    const amountOk = result.amountKobo === payment.amountKes * 100 && result.currency === "KES";
    if (result.status === "success" && amountOk) {
      await finalizeSuccessfulPayment(payment.id);
      return NextResponse.redirect(`${listingUrl}?unlocked=1`);
    }
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return NextResponse.redirect(`${listingUrl}?unlock_failed=1`);
  } catch (e) {
    console.error("paystack verify failed", e);
    return NextResponse.redirect(`${listingUrl}?unlock_failed=1`);
  }
}
