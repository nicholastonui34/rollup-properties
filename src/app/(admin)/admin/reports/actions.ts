"use server";

import { revalidatePath } from "next/cache";
import { requireVerifier, requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { banListerAction } from "@/app/(admin)/admin/listers/actions";

export async function startInvestigatingAction(reportId: string) {
  await requireVerifier();
  await prisma.report.update({ where: { id: reportId }, data: { status: "INVESTIGATING" } });
  revalidatePath("/admin/reports");
  revalidatePath("/my-reports");
}

// Confirms the listing was fake: refunds the reporter's payment (if they had
// one), suspends the listing, and bans the lister — the three things the
// homepage's refund guarantee promises, all in one transaction.
export async function refundAndBanAction(reportId: string, formData: FormData) {
  await requireAdmin();
  const resolutionNote = String(formData.get("resolutionNote") ?? "").trim();
  if (resolutionNote.length < 3) throw new Error("Provide a resolution note");

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { listing: true, unlock: { include: { payment: true } } },
  });
  if (!report) throw new Error("Report not found");

  await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: { status: "REFUNDED", resolutionNote, resolvedAt: new Date() },
    }),
    prisma.report.updateMany({
      where: { listingId: report.listingId, status: { in: ["OPEN", "INVESTIGATING"] }, id: { not: reportId } },
      data: { status: "REJECTED", resolutionNote: "Resolved via a separate report on the same listing.", resolvedAt: new Date() },
    }),
    prisma.listing.update({ where: { id: report.listingId }, data: { status: "SUSPENDED" } }),
    ...(report.unlock?.payment
      ? [
          prisma.payment.update({
            where: { id: report.unlock.payment.id },
            data: { status: "REFUNDED", refundedAt: new Date(), refundReason: `Report ${reportId}: ${resolutionNote}` },
          }),
        ]
      : []),
  ]);

  const banForm = new FormData();
  banForm.set("reason", `Fake listing confirmed (report ${reportId}): ${resolutionNote}`);
  await banListerAction(report.listing.listerId, banForm);

  revalidatePath("/admin/reports");
  revalidatePath("/my-reports");
}

export async function rejectReportAction(reportId: string, formData: FormData) {
  await requireVerifier();
  const resolutionNote = String(formData.get("resolutionNote") ?? "").trim();
  if (resolutionNote.length < 3) throw new Error("Provide a resolution note");

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "REJECTED", resolutionNote, resolvedAt: new Date() },
  });
  revalidatePath("/admin/reports");
  revalidatePath("/my-reports");
}

export async function reinstateListingAction(listingId: string) {
  await requireVerifier();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "SUSPENDED") throw new Error("Listing is not suspended");

  await prisma.listing.update({ where: { id: listingId }, data: { status: "LIVE" } });
  revalidatePath("/admin/reports");
}
