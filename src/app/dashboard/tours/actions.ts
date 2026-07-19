"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const NEXT_STATUS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
} as const;

export async function updateTourRequestStatusAction(
  tourRequestId: string,
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED"
) {
  const session = await auth();
  if (!session?.user || !["LISTER", "ADMIN"].includes(session.user.role)) {
    throw new Error("Not authorized");
  }

  const tourRequest = await prisma.tourRequest.findUnique({
    where: { id: tourRequestId },
    include: { listing: { select: { listerId: true } } },
  });
  if (!tourRequest || (tourRequest.listing.listerId !== session.user.id && session.user.role !== "ADMIN")) {
    throw new Error("Tour request not found");
  }

  const allowed = (NEXT_STATUS[tourRequest.status] as readonly string[]).includes(status);
  if (!allowed) throw new Error("Invalid status transition");

  await prisma.tourRequest.update({ where: { id: tourRequestId }, data: { status } });
  revalidatePath("/dashboard/tours");
}
