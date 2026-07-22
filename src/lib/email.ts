const FROM = process.env.EMAIL_FROM ?? "Nyoomba <alerts@nyoomba.co.ke>";

// No SMS/email provider keys exist yet (BRIEF.md §4.1 "email first, SMS later").
// Same graceful-degrade shape as Paystack: without RESEND_API_KEY we log and
// no-op instead of throwing, so alert jobs never crash the app.
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email to ${to}: "${subject}"`);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[email] resend send failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] send failed", e);
    return false;
  }
}
