"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

export async function updateMediaRequestStatusAction(
  mediaRequestId: string,
  status: "SCHEDULED" | "DELIVERED"
) {
  await requireAdmin();
  await prisma.mediaRequest.update({ where: { id: mediaRequestId }, data: { status } });
  revalidatePath("/admin/media-requests");
}
