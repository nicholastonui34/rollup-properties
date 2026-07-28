"use client";

import { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { displayPhone } from "@/lib/phone";
import { trackEvent } from "@/lib/analytics";

// Styled as a Dialog (no dedicated bottom-sheet primitive exists in this
// project yet) but anchored to the bottom edge on small screens via
// max-sm: overrides, matching the spec's "bottom sheet" intent without
// adding a new Radix dependency for one component.
export function ContactSheet({
  phone,
  whatsappPhone,
  whatsappEnabled,
  pmName,
  listingTitle,
  listingCode,
  listingId,
  trigger,
}: {
  phone: string;
  whatsappPhone: string;
  whatsappEnabled: boolean;
  pmName: string;
  listingTitle: string;
  listingCode: string;
  listingId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const waMessage = `Hi ${pmName}, I unlocked ${listingTitle} on Nyoomba (Ref ${listingCode}). Is it still available?`;
  const waUrl = `https://wa.me/${whatsappPhone.replace("+", "")}?text=${encodeURIComponent(waMessage)}`;

  function track(method: "call" | "whatsapp") {
    trackEvent("cta_contact_clicked", { listingId, method });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none">
        <DialogHeader>
          <DialogTitle>Contact {pmName}</DialogTitle>
          <DialogDescription>Reach out directly — no broker fees.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Button asChild size="lg" className="w-full justify-start gap-3" onClick={() => track("call")}>
            <a href={`tel:${phone}`}>
              <Phone className="size-4" aria-hidden="true" />
              Call {displayPhone(phone)}
            </a>
          </Button>

          {whatsappEnabled ? (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => track("whatsapp")}
            >
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" aria-hidden="true" />
                Message on WhatsApp
              </a>
            </Button>
          ) : (
            <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              This manager isn&apos;t reachable on WhatsApp — call instead.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
