import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { displayPhone } from "@/lib/phone";
import {
  TOUR_REQUEST_STATUS_BADGE_VARIANT,
  TOUR_REQUEST_STATUS_LABELS,
  TOUR_TIME_SLOT_LABELS,
  TOUR_TYPE_LABELS,
} from "@/lib/listing-options";
import { updateTourRequestStatusAction } from "./actions";

export const metadata: Metadata = { title: "Tour requests" };

export default async function TourRequestsPage() {
  const session = await auth();
  const tourRequests = await prisma.tourRequest.findMany({
    where: { listing: { listerId: session!.user.id } },
    include: { listing: { select: { title: true, slug: true } } },
    orderBy: [{ status: "asc" }, { preferredDate: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Tour requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Renters asking to view your listings. Confirm, complete, or cancel each request.
        </p>
      </div>

      {tourRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No tour requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tourRequests.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/listings/${t.listing.slug}`} className="font-medium text-foreground hover:underline">
                      {t.listing.title}
                    </Link>
                    <Badge variant={TOUR_REQUEST_STATUS_BADGE_VARIANT[t.status]}>
                      {TOUR_REQUEST_STATUS_LABELS[t.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground">
                    {t.name} · {displayPhone(t.phone)}
                    {t.email ? ` · ${t.email}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.preferredDate.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
                    {TOUR_TIME_SLOT_LABELS[t.timeSlot]} · {TOUR_TYPE_LABELS[t.tourType]}
                  </p>
                  {t.message && <p className="mt-1 text-sm text-muted-foreground">&ldquo;{t.message}&rdquo;</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Requested {t.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {t.status === "PENDING" && (
                    <>
                      <form action={updateTourRequestStatusAction.bind(null, t.id, "CONFIRMED")}>
                        <Button type="submit" size="sm">Confirm</Button>
                      </form>
                      <form action={updateTourRequestStatusAction.bind(null, t.id, "CANCELLED")}>
                        <Button type="submit" size="sm" variant="outline">Cancel</Button>
                      </form>
                    </>
                  )}
                  {t.status === "CONFIRMED" && (
                    <>
                      <form action={updateTourRequestStatusAction.bind(null, t.id, "COMPLETED")}>
                        <Button type="submit" size="sm">Mark completed</Button>
                      </form>
                      <form action={updateTourRequestStatusAction.bind(null, t.id, "CANCELLED")}>
                        <Button type="submit" size="sm" variant="outline">Cancel</Button>
                      </form>
                    </>
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
