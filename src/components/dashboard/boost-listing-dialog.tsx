"use client";

import { useActionState, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRO_MEDIA_SERVICES } from "@/lib/listing-options";
import { submitMediaRequestAction, type MediaRequestFormState } from "@/app/dashboard/media-requests/actions";

export function BoostListingDialog({
  listingId = null,
  defaultLocation = "",
  triggerLabel = "Boost your listing",
  className,
}: {
  listingId?: string | null;
  defaultLocation?: string;
  triggerLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<MediaRequestFormState, FormData>(
    submitMediaRequestAction.bind(null, listingId),
    undefined
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="lg" className={className}>
          <Sparkles className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {state?.success ? (
          <>
            <DialogHeader>
              <DialogTitle>Request sent</DialogTitle>
              <DialogDescription>
                Our team will reach out to schedule your Pro Media service.
              </DialogDescription>
            </DialogHeader>
            <Button type="button" className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Boost your listing</DialogTitle>
              <DialogDescription>
                Professional photos, video and 3D tours from Nyoomba&apos;s Pro Media team. Pricing from KES — (final
                quote after we review your request).
              </DialogDescription>
            </DialogHeader>

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label>Services</Label>
                <div className="space-y-2">
                  {PRO_MEDIA_SERVICES.map((service) => (
                    <label key={service} className="flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" name="services" value={service} className="size-4 rounded border-input" />
                      {service}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="media-location">Property location</Label>
                <Input id="media-location" name="location" defaultValue={defaultLocation} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="media-date">Preferred date (optional)</Label>
                <Input id="media-date" name="preferredDate" type="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="media-notes">Notes (optional)</Label>
                <Textarea id="media-notes" name="notes" rows={3} />
              </div>

              {state?.error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                  {state.error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Sending…" : "Request Pro Media"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
