import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Nyoomba collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="18 July 2026">
      <p>
        This policy explains what personal data Nyoomba collects, why, and how we
        protect it.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> name, phone number, email (optional), and a securely
          hashed password.
        </li>
        <li>
          <strong>Identity data (Listers):</strong> national ID number, submitted so a Nyoomba
          verifier can confirm a lister&apos;s identity before their first listing goes live.
        </li>
        <li>
          <strong>Listing data:</strong> property details, address, coordinates, and photos you
          upload.
        </li>
        <li>
          <strong>Payment metadata:</strong> transaction references, amount, and status for
          contact-unlock payments. We never see or store your card or M-Pesa PIN — payments are
          processed directly by Paystack.
        </li>
        <li>
          <strong>Usage data:</strong> saved listings, saved searches, and reports you submit, used
          to run those features.
        </li>
      </ul>

      <h2>2. Why we collect it</h2>
      <ul>
        <li>To create and secure your account, and to authenticate you when you log in.</li>
        <li>To verify listers and listings before a listing is shown publicly.</li>
        <li>To process contact-unlock payments and keep a record of what you&apos;ve unlocked.</li>
        <li>To send saved-search alert emails, if you&apos;ve turned alerts on.</li>
        <li>To investigate reports and enforce our Terms of Service.</li>
      </ul>

      <h2>3. Who we share it with</h2>
      <p>We share the minimum data needed with the services that power Nyoomba:</p>
      <ul>
        <li><strong>Paystack</strong> — payment processing for contact unlocks.</li>
        <li><strong>Cloudinary</strong> — hosting for listing photos and verification evidence.</li>
        <li><strong>Resend</strong> — delivering saved-search alert emails.</li>
        <li>Nyoomba verifiers and admin staff, internally, to review listings and reports.</li>
      </ul>
      <p>We do not sell your personal data to third parties.</p>

      <h2>4. Data retention</h2>
      <p>
        We keep your data for as long as your account is active, and afterwards only as long as
        needed for legal, verification, or dispute-resolution purposes.
      </p>

      <h2>5. Your rights</h2>
      <p>
        Under the Kenya Data Protection Act, 2019, you can request access to, correction of, or
        deletion of your personal data by contacting us at the address below. Nyoomba is working
        toward registering as a data controller with Kenya&apos;s Office of the Data Protection
        Commissioner (ODPC) ahead of public launch.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use a single session cookie to keep you signed in. We do not use third-party
        advertising trackers.
      </p>

      <h2>7. Security</h2>
      <p>
        Passwords are hashed (never stored in plain text), traffic is encrypted in transit, and
        access to identity and payment data is limited to what each role needs.
      </p>

      <h2>8. Children</h2>
      <p>Nyoomba is not intended for use by anyone under 18.</p>

      <h2>9. Changes to this policy</h2>
      <p>We&apos;ll update this page if how we handle your data materially changes.</p>

      <h2>10. Contact</h2>
      <p>Privacy questions or data requests: support@nyoomba.co.ke</p>
    </LegalLayout>
  );
}
