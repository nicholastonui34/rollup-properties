"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeKenyanPhone } from "@/lib/phone";
import { sendEmail } from "@/lib/email";
import { INCOME_RANGES } from "@/lib/listing-options";

export type ApplicationFormState = { error?: string; success?: boolean; applicationId?: string } | undefined;

const applicationSchema = z.object({
  company: z.string().optional(), // honeypot
  fullName: z.string().trim().min(2, "Enter your full name"),
  nationalId: z.string().trim().min(4, "Enter your national ID number"),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeKenyanPhone(v) !== null, "Enter a valid Kenyan phone number"),
  email: z.string().trim().email("Enter a valid email"),
  occupation: z.string().trim().min(2, "Enter your occupation"),
  employer: z.string().trim().min(2, "Enter your employer"),
  monthlyIncomeRange: z.enum(INCOME_RANGES),
  currentResidence: z.string().trim().min(2, "Enter your current residence"),
  desiredMoveInDate: z.string().min(1, "Choose a desired move-in date"),
  occupants: z.coerce.number().int().min(1, "At least 1 occupant").max(20, "Enter a realistic number"),
  refereeContact: z.string().trim().min(3, "Enter a referee name and phone/email"),
  idDocumentUrl: z.string().url("Upload your national ID copy"),
  incomeDocumentUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  consent: z.literal("on", { message: "You must consent to data processing to apply" }),
  listingId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export async function submitApplicationAction(
  pmSlug: string,
  _prev: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  if (String(formData.get("company") ?? "").trim().length > 0) {
    return { success: true };
  }

  const session = await auth();
  if (!session?.user) {
    return { error: "Log in to submit a rental application." };
  }

  const pm = await prisma.user.findUnique({ where: { pmSlug }, select: { id: true, name: true, email: true } });
  if (!pm) {
    return { error: "This property manager can't be found." };
  }
  if (pm.id === session.user.id) {
    return { error: "You can't apply to your own listings." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`application-ip:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many applications submitted recently — please try again later." };
  }

  const parsed = applicationSchema.safeParse({
    company: formData.get("company") ?? undefined,
    fullName: formData.get("fullName"),
    nationalId: formData.get("nationalId"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    occupation: formData.get("occupation"),
    employer: formData.get("employer"),
    monthlyIncomeRange: formData.get("monthlyIncomeRange"),
    currentResidence: formData.get("currentResidence"),
    desiredMoveInDate: formData.get("desiredMoveInDate"),
    occupants: formData.get("occupants"),
    refereeContact: formData.get("refereeContact"),
    idDocumentUrl: formData.get("idDocumentUrl"),
    incomeDocumentUrl: formData.get("incomeDocumentUrl") || undefined,
    consent: formData.get("consent") || undefined,
    listingId: formData.get("listingId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const phone = normalizeKenyanPhone(parsed.data.phone)!;
  if (!checkRateLimit(`application-phone:${phone}`, 3, 60 * 60 * 1000)) {
    return { error: "Too many applications from this number — please try again later." };
  }

  const moveInDate = new Date(`${parsed.data.desiredMoveInDate}T00:00:00`);
  if (Number.isNaN(moveInDate.getTime())) {
    return { error: "Choose a valid move-in date" };
  }

  // A listingId only gets attached (pinning the application to a specific
  // property) when the applicant genuinely has a verified unlock for it —
  // otherwise it's silently dropped rather than blocking the whole
  // application, matching the microsite's "deep-linking allowed" rule.
  let listingId: string | null = null;
  if (parsed.data.listingId) {
    const unlock = await prisma.unlock.findUnique({
      where: { userId_listingId: { userId: session.user.id, listingId: parsed.data.listingId } },
    });
    const listing = unlock
      ? await prisma.listing.findUnique({ where: { id: parsed.data.listingId }, select: { listerId: true } })
      : null;
    if (unlock && listing?.listerId === pm.id) {
      listingId = parsed.data.listingId;
    }
  }

  const application = await prisma.rentalApplication.create({
    data: {
      pmId: pm.id,
      applicantId: session.user.id,
      listingId,
      fullName: parsed.data.fullName,
      nationalId: parsed.data.nationalId,
      phone,
      email: parsed.data.email,
      occupation: parsed.data.occupation,
      employer: parsed.data.employer,
      monthlyIncomeRange: parsed.data.monthlyIncomeRange,
      currentResidence: parsed.data.currentResidence,
      desiredMoveInDate: moveInDate,
      occupants: parsed.data.occupants,
      refereeContact: parsed.data.refereeContact,
      idDocumentUrl: parsed.data.idDocumentUrl,
      incomeDocumentUrl: parsed.data.incomeDocumentUrl ?? null,
      consentAt: new Date(),
    },
  });

  if (pm.email) {
    await sendEmail(
      pm.email,
      `New rental application — ${parsed.data.fullName}`,
      `<p><strong>${parsed.data.fullName}</strong> (${phone}, ${parsed.data.email}) applied${
        listingId ? " for your listing" : " via your microsite"
      }.</p>
       <p><strong>Occupation:</strong> ${parsed.data.occupation} at ${parsed.data.employer}</p>
       <p><strong>Monthly income:</strong> ${parsed.data.monthlyIncomeRange}</p>
       <p>Review and respond from your Nyoomba dashboard.</p>`
    );
  }

  await sendEmail(
    parsed.data.email,
    `Application received — ${pm.name}`,
    `<p>Your rental application to <strong>${pm.name}</strong> has been received.</p>
     <p>You can track its status any time from your Nyoomba account.</p>`
  );

  return { success: true, applicationId: application.id };
}
