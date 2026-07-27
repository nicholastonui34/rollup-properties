"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnlockButton } from "@/components/listing/unlock-button";

// One extra tap (open dialog → confirm), not a page navigation — recaps the
// trust signals right at the point of payment without reintroducing the
// abandonment friction a full extra step would add.
export function UnlockDialog({
  action,
  priceKes,
  verifiedDateLabel,
  confirmedDaysAgo,
  isStale,
}: {
  action: (formData: FormData) => void;
  priceKes: number;
  verifiedDateLabel: string;
  confirmedDaysAgo: number | null;
  isStale: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="lg" className="mt-3 w-full">
          Unlock contact — KES {priceKes}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Before you pay</DialogTitle>
          <DialogDescription>Here&apos;s what you&apos;re paying for.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="gap-1 bg-gold text-gold-foreground hover:bg-gold">
              <ShieldCheck className="size-3" />
              Verified {verifiedDateLabel}
            </Badge>
            {confirmedDaysAgo != null && (
              <span className={isStale ? "text-xs text-amber-600 dark:text-amber-500" : "text-xs text-muted-foreground"}>
                {confirmedDaysAgo === 0 ? "Confirmed today" : `Confirmed ${confirmedDaysAgo}d ago`}
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            Nyoomba confirmed this listing&apos;s photos, address and ownership before it went live.
          </p>
          <p className="text-muted-foreground">
            If it turns out to be fake, you get a full refund and the lister is permanently
            banned.{" "}
            <Link href="/refund-policy" className="underline underline-offset-2">
              Refund policy
            </Link>
          </p>
        </div>

        <DialogFooter>
          <form action={action} className="w-full">
            <UnlockButton priceKes={priceKes} />
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
