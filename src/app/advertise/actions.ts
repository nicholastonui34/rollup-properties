"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export type AdvertiseInquiryFormState = { error?: string; success?: boolean } | undefined;

const inquirySchema = z.object({
  company: z.string().optional(),
  organization: z.string().trim().min(2, "Enter your organization or brand name"),
  contactName: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(10, "Tell us a bit about what you'd like to advertise"),
});

export async function submitAdvertiseInquiryAction(
  _prev: AdvertiseInquiryFormState,
  formData: FormData
): Promise<AdvertiseInquiryFormState> {
  if (String(formData.get("company") ?? "").trim().length > 0) {
    return { success: true };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`advertise:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many inquiries submitted recently — please try again later." };
  }

  const parsed = inquirySchema.safeParse({
    company: formData.get("company") ?? undefined,
    organization: formData.get("organization"),
    contactName: formData.get("contactName"),
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
      `New advertising inquiry — ${parsed.data.organization}`,
      `<p><strong>Organization:</strong> ${parsed.data.organization}</p>
       <p><strong>Contact:</strong> ${parsed.data.contactName} (${parsed.data.email})</p>
       <p>${parsed.data.message}</p>`
    );
  }

  return { success: true };
}
