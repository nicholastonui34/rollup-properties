import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";
import { UNLOCK_PRICE_KES } from "@/lib/listing-options";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "When and how contact-unlock fees are refunded on Rollup Properties.",
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund Policy" updated="18 July 2026">
      <p>
        Our promise is simple: pay a small fee once to unlock a manager&apos;s direct contact, and
        if that listing turns out to be fake, you get your money back.
      </p>

      <h2>1. What&apos;s covered</h2>
      <p>
        The KES {UNLOCK_PRICE_KES} contact-unlock fee is refundable if, after unlocking, you can
        show the listing was fake, a scam, or materially misrepresented — for example the unit
        doesn&apos;t exist, the photos don&apos;t match the real property, or the &ldquo;manager&rdquo;
        has no connection to the property.
      </p>

      <h2>2. What&apos;s not covered</h2>
      <ul>
        <li>Change of mind after unlocking a genuine listing.</li>
        <li>A unit that was accurately listed but got rented or sold to someone else before you called (mark it &ldquo;Taken&rdquo; reports help us catch this faster).</li>
        <li>Disagreements over rent, deposit, or other terms negotiated directly with the lister.</li>
      </ul>

      <h2>3. How to request a refund</h2>
      <p>
        Use the <strong>Report</strong> button on the listing page, or email us with your unlock
        receipt (visible on your{" "}
        <Link href="/unlocks" className="text-primary underline-offset-2 hover:underline">
          My unlocks
        </Link>{" "}
        page) within 14 days of unlocking. Tell us what happened when you contacted the manager.
      </p>

      <h2>4. What happens next</h2>
      <p>
        A Rollup admin reviews the report — this can include contacting the lister and, where
        needed, revisiting the verification evidence. If the listing is confirmed fake, we process
        your refund manually to the M-Pesa number or card used for the payment, and the lister is
        permanently banned from Rollup. This review is currently done by hand, so please allow up
        to 5–7 business days.
      </p>

      <h2>5. Questions</h2>
      <p>Refund questions: support@rollupproperties.co.ke</p>
    </LegalLayout>
  );
}
