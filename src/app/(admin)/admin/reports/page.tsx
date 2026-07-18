import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/listing/confirm-submit-button";
import { REPORT_STATUS_BADGE_VARIANT, REPORT_STATUS_LABELS } from "@/lib/listing-options";
import { dismissReportAction, actionReportAction, reinstateListingAction } from "./actions";

export const metadata: Metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      listing: { select: { id: true, title: true, slug: true, status: true } },
      reporter: { select: { name: true, phone: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  const openCountByListing = new Map<string, number>();
  for (const r of reports) {
    if (r.status === "OPEN") {
      openCountByListing.set(r.listingId, (openCountByListing.get(r.listingId) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Listings flagged by seekers. 3+ open reports auto-suspend a listing.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No reports yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={`/listings/${r.listing.slug}`} className="font-medium text-foreground hover:underline">
                      {r.listing.title}
                    </a>
                    <Badge variant={REPORT_STATUS_BADGE_VARIANT[r.status]}>
                      {REPORT_STATUS_LABELS[r.status]}
                    </Badge>
                    {r.listing.status === "SUSPENDED" && <Badge variant="destructive">Listing suspended</Badge>}
                    {(openCountByListing.get(r.listingId) ?? 0) > 1 && r.status === "OPEN" && (
                      <span className="text-xs text-muted-foreground">
                        {openCountByListing.get(r.listingId)} open reports on this listing
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-foreground">{r.reason}</p>
                  {r.details && <p className="mt-1 text-sm text-muted-foreground">{r.details}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reported by {r.reporter.name} ({r.reporter.phone}) ·{" "}
                    {r.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {r.status === "OPEN" && (
                    <>
                      <form action={dismissReportAction.bind(null, r.id)}>
                        <Button type="submit" size="sm" variant="outline">
                          Dismiss
                        </Button>
                      </form>
                      <form action={actionReportAction.bind(null, r.id)}>
                        <ConfirmSubmitButton
                          type="submit"
                          size="sm"
                          variant="destructive"
                          confirmMessage="Suspend this listing and mark the report actioned?"
                        >
                          Suspend listing
                        </ConfirmSubmitButton>
                      </form>
                    </>
                  )}
                  {r.listing.status === "SUSPENDED" && (
                    <form action={reinstateListingAction.bind(null, r.listing.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        Reinstate listing
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
