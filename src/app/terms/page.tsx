import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";
import { UNLOCK_PRICE_KES } from "@/lib/listing-options";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern using Rollup Properties to search, list, and unlock verified property contacts in Kenya.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="18 July 2026">
      <p>
        These terms govern your use of Rollup Properties (&ldquo;Rollup&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;), a verified property marketplace serving Kenya. By creating an account or
        using the site, you agree to these terms.
      </p>

      <h2>1. Accounts and roles</h2>
      <p>
        You may register as a <strong>Seeker</strong> (searching for a home to rent or buy) or a{" "}
        <strong>Lister</strong> (landlord, property manager, or licensed agent). You must provide
        accurate name, phone number, and identification details, and keep your account credentials
        confidential. You&apos;re responsible for activity under your account.
      </p>

      <h2>2. Listing standards (Listers)</h2>
      <ul>
        <li>You must own, manage, or have documented authority to list the property.</li>
        <li>Photos, address, price, and description must accurately represent the actual unit — no stock or recycled photos.</li>
        <li>Every listing goes through Rollup&apos;s verification process (identity check + listing review) before it appears publicly.</li>
        <li>Live listings expire 30 days after verification and must be renewed to stay visible.</li>
        <li>Listings found to be fake, duplicated, or materially misleading will be rejected, and repeat or fraudulent behaviour results in a permanent ban.</li>
      </ul>

      <h2>3. Contact unlock &amp; payments</h2>
      <p>
        Seekers pay a small one-time fee (currently KES {UNLOCK_PRICE_KES}) via M-Pesa or card,
        processed through Paystack, to reveal a lister&apos;s direct phone number for a specific
        listing. The unlock is a payment for <strong>information access</strong> — it does not
        guarantee the unit is still available, that a viewing will happen, or that any agreement
        will be reached between you and the lister. Once unlocked, contact details for that listing
        remain visible on your account.
      </p>

      <h2>4. Verification is not a guarantee</h2>
      <p>
        Rollup verifies listings before they go live using photo review, address checks, and (at
        this stage) manual admin review. Verification substantially reduces — but cannot fully
        eliminate — the risk of a fake or stale listing. Always confirm details directly with the
        manager before making any payment outside the platform.
      </p>

      <h2>5. Reports and enforcement</h2>
      <p>
        Any listing can be reported by a signed-in user. Listings that accumulate multiple open
        reports are automatically suspended pending review. Rollup may remove any listing or
        suspend any account at its discretion, including for suspected fraud, harassment, or
        violation of these terms.
      </p>

      <h2>6. Refunds</h2>
      <p>
        Unlock fees may be refunded if a listing is proven fake or materially misrepresented — see
        our <Link href="/refund-policy" className="text-primary underline-offset-2 hover:underline">Refund Policy</Link>.
      </p>

      <h2>7. Rollup&apos;s role</h2>
      <p>
        Rollup is a listings and verification platform. We are not a party to, and do not
        guarantee, any tenancy, sale, or other agreement between a seeker and a lister. Disputes
        over rent, deposits, or the condition of a property are between the parties involved.
      </p>

      <h2>8. Changes to these terms</h2>
      <p>
        We may update these terms as the product evolves. Continued use of Rollup after a change
        means you accept the updated terms.
      </p>

      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of Kenya.</p>

      <h2>10. Contact</h2>
      <p>Questions about these terms: support@rollupproperties.co.ke</p>
    </LegalLayout>
  );
}
