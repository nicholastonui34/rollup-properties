"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactSheet } from "@/components/listing/contact-sheet";
import { BookTourDialog, type TourSlotOption } from "@/components/listing/book-tour-dialog";
import { trackEvent } from "@/lib/analytics";

// The persistent 3-button CTA bar shown once a listing's contact is
// unlocked (post_unlock_cta_suite). Rendered twice by the listing page —
// inline in the contact card for desktop, and again in the fixed bottom bar
// for mobile — same dual-render pattern BookTourDialog already used before
// this feature, just extended to three buttons.
export function PostUnlockCtaBar({
  listingId,
  pmSlug,
  pmName,
  listingTitle,
  listingCode,
  phone,
  whatsappPhone,
  whatsappEnabled,
  userId,
  availableSlots,
  className,
}: {
  listingId: string;
  pmSlug: string;
  pmName: string;
  listingTitle: string;
  listingCode: string;
  phone: string;
  whatsappPhone: string;
  whatsappEnabled: boolean;
  userId?: string;
  availableSlots: TourSlotOption[];
  className?: string;
}) {
  const applyHref = `/pm/${pmSlug}?listing=${listingId}&ref=nyoomba_unlock`;

  return (
    <div className={className ?? "grid grid-cols-3 gap-2"}>
      <Button
        asChild
        size="lg"
        onClick={() => trackEvent("cta_apply_clicked", { listingId, pmSlug, userId })}
      >
        <Link href={applyHref} target="_blank" rel="noopener noreferrer">
          <FileText className="size-4" aria-hidden="true" />
          Apply
        </Link>
      </Button>

      <ContactSheet
        phone={phone}
        whatsappPhone={whatsappPhone}
        whatsappEnabled={whatsappEnabled}
        pmName={pmName}
        listingTitle={listingTitle}
        listingCode={listingCode}
        listingId={listingId}
        trigger={
          <Button variant="outline" size="lg">
            Contact
          </Button>
        }
      />

      <BookTourDialog
        listingId={listingId}
        pmSlug={pmSlug}
        userId={userId}
        availableSlots={availableSlots}
        triggerVariant="outline"
        triggerLabel="Book Tour"
      />
    </div>
  );
}
