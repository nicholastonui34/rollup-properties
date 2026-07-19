import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResolutionNoteButton } from "@/components/admin/resolution-note-button";
import { REPORT_STATUS_BADGE_VARIANT, REPORT_STATUS_LABELS } from "@/lib/listing-options";
import { startInvestigatingAction, refundAndBanAction, rejectReportAction, reinstateListingAction } from "./actions";

export const metadata: Metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      listing: { select: { id: true, title: true, slug: true, status: true } },
      reporter: { select: { name: true, phone: true } },
      unlock: { include: { payment: { select: { amountKes: true, status: true } } } },
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
          Listings flagged by seekers. 3+ open reports auto-suspend a listing. Confirming a report
          as fake refunds the reporter&apos;s unlock (if any), suspends the listing, and bans the
          lister.
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
                    {r.unlock?.payment ? (
                      <span className="text-xs text-muted-foreground">
                        Paid KES {r.unlock.payment.amountKes} ({r.unlock.payment.status.toLowerCase()})
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No payment to refund</span>
                    )}
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
                  {r.resolutionNote && (
                    <p className="mt-1 text-xs text-muted-foreground">Resolution: {r.resolutionNote}</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {r.status === "OPEN" && (
                    <form action={startInvestigatingAction.bind(null, r.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        Start investigating
                      </Button>
                    </form>
                  )}
                  {(r.status === "OPEN" || r.status === "INVESTIGATING") && (
                    <>
                      <form action={refundAndBanAction.bind(null, r.id)}>
                        <ResolutionNoteButton
                          label={r.unlock ? "Confirm fake — refund & ban" : "Confirm fake — suspend & ban"}
                          confirmLabel="Confirm"
                          placeholder="Why is this confirmed fake?"
                          variant="destructive"
                        />
                      </form>
                      <form action={rejectReportAction.bind(null, r.id)}>
                        <ResolutionNoteButton
                          label="Reject — listing is legitimate"
                          confirmLabel="Confirm"
                          placeholder="Why is this being rejected?"
                          variant="outline"
                        />
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
