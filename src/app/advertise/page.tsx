import type { Metadata } from "next";
import { Sparkles, LayoutGrid, MapPinned } from "lucide-react";
import { InquiryForm } from "@/components/advertise/inquiry-form";

export const metadata: Metadata = {
  title: "Advertise on Nyoomba",
  description: "Reach serious renters and buyers across Kenya with featured listings and banner placements on Nyoomba.",
};

export default function AdvertisePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Advertise on Nyoomba
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Nyoomba reaches renters and buyers actively searching for a home right now — not casual
        browsers. Put your listing, brand or neighbourhood in front of that intent-driven
        audience.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Sparkles className="size-6 text-primary" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-foreground">Featured listings</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Boost a verified listing to the top of relevant search results for a set period.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <LayoutGrid className="size-6 text-primary" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-foreground">Banner placements</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Reach seekers on search and listing pages with a placement that fits our design, not
            against it.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <MapPinned className="size-6 text-primary" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-foreground">Sponsored neighbourhoods</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Own visibility across a specific area&apos;s listings — ideal for developers and area
            specialists.
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Pricing depends on placement and duration — tell us what you have in mind and we&apos;ll
        follow up with options.
      </p>

      <div className="mt-6">
        <InquiryForm />
      </div>
    </div>
  );
}
