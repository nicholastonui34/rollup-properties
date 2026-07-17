import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paystack";
import { finalizeSuccessfulPayment } from "@/lib/unlock";

// Source of truth for payment confirmation — Paystack recommends the webhook
// over the redirect callback since users can close the browser mid-flow.
// Both paths call the same idempotent finalizeSuccessfulPayment().
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; amount?: number; currency?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const payment = await prisma.payment.findUnique({ where: { providerRef: event.data.reference } });
    if (payment && payment.status !== "SUCCESS") {
      const amountOk = event.data.amount === payment.amountKes * 100 && event.data.currency === "KES";
      if (amountOk) {
        await finalizeSuccessfulPayment(payment.id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
