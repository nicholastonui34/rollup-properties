"use client";

import { ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function RealtorLink({ url, agencyName, listingId }: { url: string; agencyName: string; listingId: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("realtor_link_clicked", { listingId, agencyName })}
      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      Visit {agencyName} website
      <ExternalLink className="size-3" aria-hidden="true" />
    </a>
  );
}
