"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireVerifier, requireAdmin } from "@/lib/auth-guards";

const FEATURE_DURATION_DAYS = 30;

const evidenceSchema = z.array(z.object({ url: z.string().url(), publicId: z.string().min(1) }));

export async function startReviewAction(listingId: string) {
  await requireVerifier();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");
  if (listing.status !== "SUBMITTED") throw new Error("Listing isn't awaiting review");

  await prisma.listing.update({ where: { id: listingId }, data: { status: "IN_VERIFICATION" } });
  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${listingId}`);
}

async function recordDecision(
  listingId: string,
  status: "APPROVED" | "REJECTED" | "NEEDS_INFO",
  notes: string,
  evidence: { url: string; publicId: string }[]
) {
  const verifier = await requireVerifier();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");
  if (!["SUBMITTED", "IN_VERIFICATION", "NEEDS_INFO"].includes(listing.status)) {
    throw new Error("Listing isn't awaiting review");
  }

  const parsedEvidence = evidenceSchema.parse(evidence);

  await prisma.$transaction([
    prisma.verification.create({
      data: {
        listingId,
        verifierId: verifier.id,
        status,
        notes: notes || null,
        evidenceUrls: parsedEvidence.map((e) => e.url),
      },
    }),
    prisma.listing.update({
      where: { id: listingId },
      data:
        status === "APPROVED"
          ? {
              status: "LIVE",
              verifiedAt: new Date(),
              verifiedById: verifier.id,
              lastConfirmedAt: new Date(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
          : { status },
    }),
  ]);

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${listingId}`);
  revalidatePath("/dashboard");
}

export async function approveListingAction(
  listingId: string,
  payload: { notes?: string; evidence: { url: string; publicId: string }[] }
) {
  await recordDecision(listingId, "APPROVED", payload.notes ?? "", payload.evidence);
}

const reasonSchema = z.string().trim().min(10, "Give the lister a clear, actionable reason (10+ characters)");

function parseReason(notes: string) {
  const parsed = reasonSchema.safeParse(notes);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  return parsed.data;
}

export async function rejectListingAction(
  listingId: string,
  payload: { notes: string; evidence: { url: string; publicId: string }[] }
) {
  const notes = parseReason(payload.notes);
  await recordDecision(listingId, "REJECTED", notes, payload.evidence);
}

export async function needsInfoListingAction(
  listingId: string,
  payload: { notes: string; evidence: { url: string; publicId: string }[] }
) {
  const notes = parseReason(payload.notes);
  await recordDecision(listingId, "NEEDS_INFO", notes, payload.evidence);
}

// Manual admin toggle only — no payment rail wired to this yet (spec §8
// explicitly says not to add one without confirmation).
export async function setFeaturedAction(listingId: string) {
  await requireAdmin();
  await prisma.listing.update({
    where: { id: listingId },
    data: { featuredUntil: new Date(Date.now() + FEATURE_DURATION_DAYS * 24 * 60 * 60 * 1000) },
  });
  revalidatePath(`/admin/verifications/${listingId}`);
  revalidatePath("/search");
}

export async function unfeatureAction(listingId: string) {
  await requireAdmin();
  await prisma.listing.update({ where: { id: listingId }, data: { featuredUntil: null } });
  revalidatePath(`/admin/verifications/${listingId}`);
  revalidatePath("/search");
}
