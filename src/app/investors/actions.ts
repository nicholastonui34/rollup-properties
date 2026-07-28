"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export type InvestorInquiryFormState = { error?: string; success?: boolean } | undefined;

const inquirySchema = z.object({
  company: z.string().optional(),
  name: z.string().trim().min(2, "Enter your name"),
  organization: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email"),
  ticketSize: z.string().trim().optional(),
  message: z.string().trim().min(10, "Tell us a bit about your interest"),
});

export async function submitInvestorInquiryAction(
  _prev: InvestorInquiryFormState,
  formData: FormData
): Promise<InvestorInquiryFormState> {
  if (String(formData.get("company") ?? "").trim().length > 0) {
    return { success: true };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`investors:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many inquiries submitted recently — please try again later." };
  }

  const parsed = inquirySchema.safeParse({
    company: formData.get("company") ?? undefined,
    name: formData.get("name"),
    organization: formData.get("organization") || undefined,
    email: formData.get("email"),
    ticketSize: formData.get("ticketSize") || undefined,
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const teamEmail = process.env.TEAM_EMAIL;
  if (teamEmail) {
    await sendEmail(
      teamEmail,
      `New investor inquiry — ${parsed.data.name}`,
      `<p><strong>From:</strong> ${parsed.data.name} (${parsed.data.email})</p>
       ${parsed.data.organization ? `<p><strong>Organization:</strong> ${parsed.data.organization}</p>` : ""}
       ${parsed.data.ticketSize ? `<p><strong>Ticket size:</strong> ${parsed.data.ticketSize}</p>` : ""}
       <p>${parsed.data.message}</p>`
    );
  }

  return { success: true };
}
