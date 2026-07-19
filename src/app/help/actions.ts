"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export type ContactFormState = { error?: string; success?: boolean } | undefined;

const contactSchema = z.object({
  company: z.string().optional(),
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters)"),
});

export async function submitContactAction(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  if (String(formData.get("company") ?? "").trim().length > 0) {
    return { success: true };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many messages submitted recently — please try again later." };
  }

  const parsed = contactSchema.safeParse({
    company: formData.get("company") ?? undefined,
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const teamEmail = process.env.TEAM_EMAIL;
  if (teamEmail) {
    await sendEmail(
      teamEmail,
      `New Help Centre message from ${parsed.data.name}`,
      `<p><strong>From:</strong> ${parsed.data.name} (${parsed.data.email})</p><p>${parsed.data.message}</p>`
    );
  }

  return { success: true };
}
