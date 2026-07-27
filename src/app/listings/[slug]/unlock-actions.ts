"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";
import { UNLOCK_PRICE_KES } from "@/lib/listing-options";
import { checkRateLimit } from "@/lib/rate-limit";
import { getBaseUrl } from "@/lib/site";

export async function initiateUnlockAction(listingId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "LIVE") redirect("/search");
  if (listing.listerId === session.user.id) redirect(`/listings/${listing.slug}`);

  if (!checkRateLimit(`unlock:${session.user.id}`, 5, 10 * 60 * 1000)) {
    redirect(`/listings/${listing.slug}?unlock_failed=1`);
  }

  const existing = await prisma.unlock.findUnique({
    where: { userId_listingId: { userId: session.user.id, listingId } },
  });
  if (existing) redirect(`/listings/${listing.slug}`);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const email = user.email ?? `${user.phone.replace("+", "")}@nyoomba.co.ke`;
  const reference = `unlock_${crypto.randomBytes(10).toString("hex")}`;

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      listingId,
      amountKes: UNLOCK_PRICE_KES,
      provider: "PAYSTACK",
      providerRef: reference,
      phone: user.phone,
      status: "PENDING",
      purpose: "UNLOCK",
    },
  });

  const baseUrl = await getBaseUrl();

  let authorizationUrl: string;
  try {
    const init = await initializeTransaction({
      email,
      amountKes: UNLOCK_PRICE_KES,
      reference,
      callbackUrl: `${baseUrl}/payments/callback`,
      metadata: { listingId, userId: user.id, paymentId: payment.id },
    });
    authorizationUrl = init.authorization_url;
  } catch (e) {
    console.error("paystack initialize failed", e);
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    redirect(`/listings/${listing.slug}?unlock_failed=1`);
  }

  redirect(authorizationUrl);
}
