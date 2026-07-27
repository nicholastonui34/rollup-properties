"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { normalizeKenyanPhone } from "@/lib/phone";

export type PmProfileFormState = { error?: string; success?: boolean } | undefined;

const schema = z.object({
  pmBio: z
    .string()
    .trim()
    .max(500, "Keep it under 500 characters")
    .optional()
    .transform((v) => (v ? v : undefined)),
  whatsappPhone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  whatsappEnabled: z.enum(["on"]).optional(),
});

export async function updatePmProfileAction(
  _prev: PmProfileFormState,
  formData: FormData
): Promise<PmProfileFormState> {
  const session = await auth();
  if (!session?.user || !["LISTER", "ADMIN"].includes(session.user.role)) {
    return { error: "Not authorized" };
  }

  const parsed = schema.safeParse({
    pmBio: formData.get("pmBio") || undefined,
    whatsappPhone: formData.get("whatsappPhone") || undefined,
    whatsappEnabled: formData.get("whatsappEnabled") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let whatsappPhone: string | null | undefined = undefined;
  if (parsed.data.whatsappPhone) {
    const normalized = normalizeKenyanPhone(parsed.data.whatsappPhone);
    if (!normalized) return { error: "Enter a valid Kenyan WhatsApp number" };
    whatsappPhone = normalized;
  } else {
    whatsappPhone = null;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      pmBio: parsed.data.pmBio ?? null,
      whatsappPhone,
      whatsappEnabled: parsed.data.whatsappEnabled === "on",
    },
  });

  revalidatePath("/dashboard/settings/pm-profile");
  return { success: true };
}
