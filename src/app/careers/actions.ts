"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeKenyanPhone } from "@/lib/phone";
import { findCareerRole } from "@/lib/careers";

export type CareerApplicationFormState = { error?: string; success?: boolean } | undefined;

const applicationSchema = z.object({
  // Honeypot — see tour-actions.ts for the same pattern.
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
  cvUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || z.string().url().safeParse(v).success, "CV link must be a valid URL"),
  note: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export async function submitCareerApplicationAction(
  roleSlug: string | null,
  _prev: CareerApplicationFormState,
  formData: FormData
): Promise<CareerApplicationFormState> {
  if (String(formData.get("company") ?? "").trim().length > 0) {
    return { success: true };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`career-app:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many applications submitted recently — please try again later." };
  }

  const parsed = applicationSchema.safeParse({
    company: formData.get("company") ?? undefined,
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    cvUrl: formData.get("cvUrl") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (roleSlug && !findCareerRole(roleSlug)) {
    return { error: "That role isn't open right now." };
  }

  const phone = normalizeKenyanPhone(parsed.data.phone)!;
  const role = roleSlug ? findCareerRole(roleSlug) : null;

  await prisma.careerApplication.create({
    data: {
      roleSlug: roleSlug ?? null,
      name: parsed.data.name,
      phone,
      email: parsed.data.email ?? null,
      cvUrl: parsed.data.cvUrl ?? null,
      note: parsed.data.note ?? null,
    },
  });

  const teamEmail = process.env.TEAM_EMAIL;
  if (teamEmail) {
    await sendEmail(
      teamEmail,
      `New application — ${role ? role.title : "General / talent pool"}`,
      `<p>${parsed.data.name} (${phone}${parsed.data.email ? `, ${parsed.data.email}` : ""}) applied${role ? ` for <strong>${role.title}</strong>` : " to the general talent pool"}.</p>
       ${parsed.data.cvUrl ? `<p><strong>CV:</strong> <a href="${parsed.data.cvUrl}">${parsed.data.cvUrl}</a></p>` : ""}
       ${parsed.data.note ? `<p><strong>Note:</strong> ${parsed.data.note}</p>` : ""}`
    );
  }

  return { success: true };
}
