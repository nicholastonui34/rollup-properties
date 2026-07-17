"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type KycFormState = { error?: string } | undefined;

const idSchema = z.string().trim().min(4, "Enter a valid ID number");

export async function submitIdNumberAction(
  _prev: KycFormState,
  formData: FormData
): Promise<KycFormState> {
  const session = await auth();
  if (!session?.user || !["LISTER", "ADMIN"].includes(session.user.role)) {
    return { error: "Not authorized" };
  }

  const parsed = idSchema.safeParse(formData.get("idNumber"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.user.update({
    where: { id: session.user.id },
    // Re-submitting a new ID number clears any prior verification — it needs a fresh review.
    data: { idNumber: parsed.data, idVerifiedAt: null },
  });

  revalidatePath("/dashboard");
  return { error: undefined };
}
