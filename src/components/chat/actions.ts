"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export type ChatHandoffFormState = { error?: string; success?: boolean } | undefined;

const handoffSchema = z.object({
  company: z.string().optional(),
  name: z.string().trim().min(2, "Enter your name"),
  contact: z.string().trim().min(5, "Enter a phone number or email"),
  message: z.string().trim().min(5, "Tell us what you need help with"),
  transcript: z.string().optional(),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function submitChatHandoffAction(
  _prev: ChatHandoffFormState,
  formData: FormData
): Promise<ChatHandoffFormState> {
  if (String(formData.get("company") ?? "").trim().length > 0) {
    return { success: true };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`chat-handoff:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many requests submitted recently — please try again later." };
  }

  const parsed = handoffSchema.safeParse({
    company: formData.get("company") ?? undefined,
    name: formData.get("name"),
    contact: formData.get("contact"),
    message: formData.get("message"),
    transcript: formData.get("transcript") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let transcriptHtml = "";
  if (parsed.data.transcript) {
    try {
      const messages = JSON.parse(parsed.data.transcript) as { role: string; text: string }[];
      transcriptHtml = messages
        .slice(-10)
        .map((m) => `<p><strong>${m.role === "user" ? "Visitor" : "Bot"}:</strong> ${escapeHtml(m.text)}</p>`)
        .join("");
    } catch {
      transcriptHtml = "";
    }
  }

  const teamEmail = process.env.TEAM_EMAIL;
  if (teamEmail) {
    await sendEmail(
      teamEmail,
      `Chat handoff — ${parsed.data.name} needs a human`,
      `<p><strong>From:</strong> ${escapeHtml(parsed.data.name)} (${escapeHtml(parsed.data.contact)})</p>
       <p><strong>Message:</strong> ${escapeHtml(parsed.data.message)}</p>
       ${transcriptHtml ? `<hr /><p><strong>Recent chat:</strong></p>${transcriptHtml}` : ""}`
    );
  }

  return { success: true };
}
