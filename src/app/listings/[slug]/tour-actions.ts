"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeKenyanPhone, displayPhone } from "@/lib/phone";
import { sendEmail } from "@/lib/email";
import { TOUR_TIME_SLOT_LABELS, TOUR_TYPE_LABELS } from "@/lib/listing-options";

export type TourFormState = { error?: string; success?: boolean } | undefined;

const tourSchema = z.object({
  // Honeypot — real visitors never fill this hidden field; bots that
  // autofill every input will, so we quietly no-op instead of erroring
  // (an error response would tell the bot which field to skip next time).
  company: z.string().optional(),
  name: z.string().trim().min(2, "Enter your name"),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeKenyanPhone(v) !== null, "Enter a valid Kenyan phone number"),
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || z.string().email().safeParse(v).success, "Enter a valid email"),
  preferredDate: z.string().min(1, "Choose a preferred date"),
  timeSlot: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  tourType: z.enum(["IN_PERSON", "VIDEO_CALL"]),
  message: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export async function submitTourRequestAction(
  listingId: string,
  _prev: TourFormState,
  formData: FormData
): Promise<TourFormState> {
  // Honeypot tripped — pretend success so the bot doesn't learn anything.
  if (String(formData.get("company") ?? "").trim().length > 0) {
    return { success: true };
  }

  // Booking a tour requires having already paid to unlock this listing's
  // contact — enforced server-side (not just hiding the button) since a
  // form action can be called directly. ADMIN can always book (matches the
  // admin contact-card bypass elsewhere on the listing page).
  const session = await auth();
  if (!session?.user) {
    return { error: "Log in and unlock this listing's contact before booking a tour." };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { lister: { select: { name: true, email: true } } },
  });
  if (!listing || listing.status !== "LIVE") {
    return { error: "This listing isn't accepting tour requests right now." };
  }
  if (listing.listerId === session.user.id) {
    return { error: "You can't book a tour on your own listing." };
  }
  if (session.user.role !== "ADMIN") {
    const unlock = await prisma.unlock.findUnique({
      where: { userId_listingId: { userId: session.user.id, listingId } },
    });
    if (!unlock) {
      return { error: "Unlock this listing's contact before booking a tour." };
    }
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`tour-ip:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many tour requests submitted recently — please try again later." };
  }

  const parsed = tourSchema.safeParse({
    company: formData.get("company") ?? undefined,
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    preferredDate: formData.get("preferredDate"),
    timeSlot: formData.get("timeSlot"),
    tourType: formData.get("tourType"),
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const phone = normalizeKenyanPhone(parsed.data.phone)!;
  if (!checkRateLimit(`tour-phone:${phone}`, 3, 60 * 60 * 1000)) {
    return { error: "Too many tour requests from this number — please try again later." };
  }

  const preferredDate = new Date(`${parsed.data.preferredDate}T00:00:00`);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const maxDate = new Date(startOfToday.getTime() + 14 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(preferredDate.getTime()) || preferredDate < startOfToday || preferredDate > maxDate) {
    return { error: "Choose a date within the next 14 days" };
  }

  await prisma.tourRequest.create({
    data: {
      listingId,
      name: parsed.data.name,
      phone,
      email: parsed.data.email ?? null,
      preferredDate,
      timeSlot: parsed.data.timeSlot,
      tourType: parsed.data.tourType,
      message: parsed.data.message ?? null,
    },
  });

  if (listing.lister.email) {
    const dateLabel = preferredDate.toLocaleDateString("en-KE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const whatsappUrl = `https://wa.me/${phone.replace("+", "")}?text=${encodeURIComponent(
      `Hi ${parsed.data.name}, thanks for your interest in "${listing.title}" on Rollup Properties! `
    )}`;
    await sendEmail(
      listing.lister.email,
      `New tour request — ${listing.title}`,
      `<p>${parsed.data.name} (${displayPhone(phone)}) requested a ${TOUR_TYPE_LABELS[parsed.data.tourType]} tour of <strong>${listing.title}</strong>.</p>
       <p><strong>Preferred date:</strong> ${dateLabel} (${TOUR_TIME_SLOT_LABELS[parsed.data.timeSlot]})</p>
       ${parsed.data.email ? `<p><strong>Email:</strong> ${parsed.data.email}</p>` : ""}
       ${parsed.data.message ? `<p><strong>Message:</strong> ${parsed.data.message}</p>` : ""}
       <p><a href="${whatsappUrl}">Message ${parsed.data.name} on WhatsApp</a></p>
       <p>Manage this request from your Rollup Properties dashboard.</p>`
    );
  }

  return { success: true };
}
