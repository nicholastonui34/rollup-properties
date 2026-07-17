"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

const reasonSchema = z.string().trim().min(3, "Give a reason for the refund");

// Records a refund that was actually processed manually via the Paystack/M-Pesa
// dashboard (BRIEF.md §4.6) — this does not move money itself, it just keeps
// the ledger honest.
export async function refundPaymentAction(paymentId: string, formData: FormData) {
  await requireAdmin();
  const parsed = reasonSchema.safeParse(formData.get("reason"));
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found");
  if (payment.status !== "SUCCESS") throw new Error("Only successful payments can be refunded");

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "REFUNDED", refundedAt: new Date(), refundReason: parsed.data },
  });

  revalidatePath("/admin/payments");
  revalidatePath("/unlocks");
}
