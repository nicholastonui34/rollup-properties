"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export function ApplyButton({ url, listingId }: { url: string; listingId: string }) {
  return (
    <Button asChild size="lg" className="mt-3 w-full">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("apply_button_clicked", { listingId })}
      >
        Apply
        <ExternalLink className="size-4" aria-hidden="true" />
      </a>
    </Button>
  );
}
