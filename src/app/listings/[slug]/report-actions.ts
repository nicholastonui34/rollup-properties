"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REPORT_AUTO_SUSPEND_THRESHOLD } from "@/lib/listing-options";
import { checkRateLimit } from "@/lib/rate-limit";

export async function reportListingAction(listingId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!checkRateLimit(`report:${session.user.id}`, 5, 60 * 60 * 1000)) {
    throw new Error("Too many reports submitted recently — please try again later.");
  }

  const reason = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  if (!reason) throw new Error("Select a reason");

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");

  await prisma.report.create({
    data: {
      listingId,
      reporterId: session.user.id,
      reason,
      details: details || null,
    },
  });

  // Auto-suspend once open reports pile up — pulls the listing from public
  // view while a human reviews it (BRIEF.md §4.6).
  const openCount = await prisma.report.count({ where: { listingId, status: "OPEN" } });
  if (openCount >= REPORT_AUTO_SUSPEND_THRESHOLD && listing.status === "LIVE") {
    await prisma.listing.update({ where: { id: listingId }, data: { status: "SUSPENDED" } });
    redirect(`/search?reported=1`);
  }

  redirect(`/listings/${listing.slug}?reported=1`);
}
