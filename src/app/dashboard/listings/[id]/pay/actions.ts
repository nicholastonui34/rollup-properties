"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";
import { LISTING_PUBLISH_FEE_KES, MIN_LISTING_PHOTOS } from "@/lib/listing-options";
import { getBaseUrl } from "@/lib/site";

export async function initiateListingPublishPaymentAction(listingId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, include: { images: true } });
  if (!listing || listing.listerId !== session.user.id) redirect("/dashboard");
  if (listing.publishedAt) redirect(`/dashboard/listings/${listingId}/edit`);
  if (listing.images.length < MIN_LISTING_PHOTOS) {
    redirect(`/dashboard/listings/${listingId}/edit`);
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const email = user.email ?? `${user.phone.replace("+", "")}@nyoomba.co.ke`;
  const reference = `listingfee_${crypto.randomBytes(10).toString("hex")}`;

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      listingId,
      amountKes: LISTING_PUBLISH_FEE_KES,
      provider: "PAYSTACK",
      providerRef: reference,
      phone: user.phone,
      status: "PENDING",
      purpose: "LISTING_FEE",
    },
  });

  const baseUrl = await getBaseUrl();

  let authorizationUrl: string;
  try {
    const init = await initializeTransaction({
      email,
      amountKes: LISTING_PUBLISH_FEE_KES,
      reference,
      callbackUrl: `${baseUrl}/payments/callback`,
      metadata: { listingId, userId: user.id, paymentId: payment.id, purpose: "LISTING_FEE" },
    });
    authorizationUrl = init.authorization_url;
  } catch (e) {
    console.error("paystack initialize failed (listing fee)", e);
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    redirect(`/dashboard/listings/${listingId}/pay?failed=1`);
  }

  redirect(authorizationUrl);
}
