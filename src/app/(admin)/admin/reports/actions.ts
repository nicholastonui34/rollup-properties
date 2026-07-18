"use server";

import { revalidatePath } from "next/cache";
import { requireVerifier } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function dismissReportAction(reportId: string) {
  await requireVerifier();
  await prisma.report.update({ where: { id: reportId }, data: { status: "DISMISSED" } });
  revalidatePath("/admin/reports");
}

export async function actionReportAction(reportId: string) {
  await requireVerifier();
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new Error("Report not found");

  await prisma.$transaction([
    prisma.report.update({ where: { id: reportId }, data: { status: "ACTIONED" } }),
    prisma.report.updateMany({
      where: { listingId: report.listingId, status: "OPEN" },
      data: { status: "REVIEWED" },
    }),
    prisma.listing.update({ where: { id: report.listingId }, data: { status: "SUSPENDED" } }),
  ]);

  revalidatePath("/admin/reports");
}

export async function reinstateListingAction(listingId: string) {
  await requireVerifier();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "SUSPENDED") throw new Error("Listing is not suspended");

  await prisma.$transaction([
    prisma.listing.update({ where: { id: listingId }, data: { status: "LIVE" } }),
    prisma.report.updateMany({
      where: { listingId, status: "OPEN" },
      data: { status: "REVIEWED" },
    }),
  ]);
  revalidatePath("/admin/reports");
}
