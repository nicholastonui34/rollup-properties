"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireVerifier, requireAdmin } from "@/lib/auth-guards";

export async function verifyListerKycAction(userId: string) {
  await requireVerifier();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (!user.idNumber) throw new Error("This lister hasn't submitted an ID number yet");

  await prisma.user.update({ where: { id: userId }, data: { idVerifiedAt: new Date() } });
  revalidatePath("/admin/listers");
  revalidatePath("/admin/verifications");
}

// Backs the homepage/refund-policy promise that a fake-listing lister is
// "permanently banned" — blocks their future logins (src/lib/auth.ts) and
// pulls their other live/in-review listings from public view immediately.
export async function banListerAction(userId: string, formData: FormData) {
  await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 3) throw new Error("Provide a ban reason");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.role !== "LISTER") throw new Error("Only listers can be banned");

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { bannedAt: new Date(), banReason: reason } }),
    prisma.listing.updateMany({
      where: { listerId: userId, status: { in: ["LIVE", "SUBMITTED", "IN_VERIFICATION", "NEEDS_INFO"] } },
      data: { status: "SUSPENDED" },
    }),
  ]);
  revalidatePath("/admin/listers");
  revalidatePath("/admin/reports");
  revalidatePath("/search");
}

export async function unbanListerAction(userId: string) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { bannedAt: null, banReason: null } });
  revalidatePath("/admin/listers");
}
