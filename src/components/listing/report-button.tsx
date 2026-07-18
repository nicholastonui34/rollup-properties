"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_REASONS } from "@/lib/listing-options";

export function ReportButton({
  action,
  loggedIn,
}: {
  action: (formData: FormData) => void;
  loggedIn: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!loggedIn) {
    return (
      <Link href="/login" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
        Log in to report this listing
      </Link>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
      >
        <Flag className="size-3" />
        Report this listing
      </button>
    );
  }

  return (
    <form action={action} className="space-y-2 rounded-xl border border-border bg-card p-3 text-left">
      <p className="text-xs font-medium text-foreground">What&apos;s wrong with this listing?</p>
      <select
        name="reason"
        required
        className="h-9 w-full rounded-lg border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">Select a reason</option>
        {REPORT_REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <Textarea name="details" placeholder="Any extra details (optional)" className="min-h-16 text-xs" />
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" variant="destructive">
          Submit report
        </Button>
      </div>
    </form>
  );
}
