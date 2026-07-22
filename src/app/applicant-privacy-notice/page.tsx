import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Applicant Privacy Notice",
  description: "How Nyoomba handles personal data submitted through job applications and tour/contact request forms.",
};

export default function ApplicantPrivacyNoticePage() {
  return (
    <LegalLayout title="Applicant Privacy Notice" updated="19 July 2026">
      <p className="rounded-lg bg-secondary px-4 py-2 text-xs text-secondary-foreground">
        Draft — this notice is pending review by qualified legal counsel before public launch.
      </p>

      <p>
        This notice explains what personal data Nyoomba collects when you apply for a
        role with us, book a property tour, or submit a contact/inquiry form, and how we handle
        it under the Kenya Data Protection Act, 2019.
      </p>

      <h2>1. Who this applies to</h2>
      <p>
        Job applicants (careers page), renters and buyers submitting a tour request, and anyone
        submitting a contact, advertising, or Help Centre inquiry form.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>Job applicants:</strong> name, phone number, email, a link to your CV or
          portfolio, and any cover note you provide.
        </li>
        <li>
          <strong>Tour requests:</strong> name, phone number, optional email, preferred date/time,
          tour type, and any message you include.
        </li>
        <li>
          <strong>Contact/advertising inquiries:</strong> name, email, organization (where
          relevant), and your message.
        </li>
      </ul>

      <h2>3. Why we collect it</h2>
      <ul>
        <li>To evaluate job applications and contact candidates about roles.</li>
        <li>To pass tour requests to the relevant property manager so they can arrange a viewing.</li>
        <li>To respond to inquiries about advertising, partnerships, or general support.</li>
      </ul>

      <h2>4. Who we share it with</h2>
      <p>
        Job applications are seen only by Nyoomba&apos;s hiring team. Tour requests are shared with
        the property manager for the specific listing you inquired about. We do not sell any of
        this data to third parties.
      </p>

      <h2>5. Retention</h2>
      <p>
        We keep job application data for as long as a role search is active plus a reasonable
        period afterward in case a similar role opens, then delete it. Tour and contact form
        submissions are kept only as long as needed to action the request and for basic
        record-keeping.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Under the Kenya Data Protection Act, 2019, you can request access to, correction of, or
        deletion of the personal data you&apos;ve submitted by contacting us at the address below.
      </p>

      <h2>7. Contact</h2>
      <p>Data requests relating to this notice: support@nyoomba.co.ke</p>
    </LegalLayout>
  );
}
