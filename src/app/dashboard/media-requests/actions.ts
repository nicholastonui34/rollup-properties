"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { PRO_MEDIA_SERVICES } from "@/lib/listing-options";

export type MediaRequestFormState = { error?: string; success?: boolean } | undefined;

const mediaRequestSchema = z.object({
  services: z.array(z.enum(PRO_MEDIA_SERVICES)).min(1, "Pick at least one service"),
  location: z.string().trim().min(3, "Enter the property location"),
  preferredDate: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export async function submitMediaRequestAction(
  listingId: string | null,
  _prev: MediaRequestFormState,
  formData: FormData
): Promise<MediaRequestFormState> {
  const session = await auth();
  if (!session?.user || !["LISTER", "ADMIN"].includes(session.user.role)) {
    return { error: "Not authorized" };
  }

  const parsed = mediaRequestSchema.safeParse({
    services: formData.getAll("services"),
    location: formData.get("location"),
    preferredDate: formData.get("preferredDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.mediaRequest.create({
    data: {
      userId: session.user.id,
      listingId: listingId ?? null,
      services: parsed.data.services,
      location: parsed.data.location,
      preferredDate: parsed.data.preferredDate ? new Date(`${parsed.data.preferredDate}T00:00:00`) : null,
      notes: parsed.data.notes ?? null,
    },
  });

  const teamEmail = process.env.TEAM_EMAIL;
  if (teamEmail) {
    await sendEmail(
      teamEmail,
      "New Pro Media request — Nyoomba",
      `<p>${session.user.name ?? "A lister"} requested: ${parsed.data.services.join(", ")}.</p>
       <p><strong>Location:</strong> ${parsed.data.location}</p>
       ${parsed.data.preferredDate ? `<p><strong>Preferred date:</strong> ${parsed.data.preferredDate}</p>` : ""}
       ${parsed.data.notes ? `<p><strong>Notes:</strong> ${parsed.data.notes}</p>` : ""}`
    );
  }

  return { success: true };
}
