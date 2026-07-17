"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireVerifier } from "@/lib/auth-guards";

export async function verifyListerKycAction(userId: string) {
  await requireVerifier();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (!user.idNumber) throw new Error("This lister hasn't submitted an ID number yet");

  await prisma.user.update({ where: { id: userId }, data: { idVerifiedAt: new Date() } });
  revalidatePath("/admin/listers");
  revalidatePath("/admin/verifications");
}
