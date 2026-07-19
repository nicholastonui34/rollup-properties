import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MEDIA_REQUEST_STATUS_LABELS } from "@/lib/listing-options";
import { updateMediaRequestStatusAction } from "./actions";

export const metadata: Metadata = { title: "Pro Media requests" };

const STATUS_BADGE_VARIANT = {
  NEW: "secondary",
  SCHEDULED: "default",
  DELIVERED: "outline",
} as const;

export default async function AdminMediaRequestsPage() {
  await requireAdmin();

  const requests = await prisma.mediaRequest.findMany({
    include: {
      user: { select: { name: true, phone: true, email: true } },
      listing: { select: { title: true, slug: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Pro Media requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Photography, video and 3D tour requests from listers.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No Pro Media requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{r.user.name}</span>
                    <Badge variant={STATUS_BADGE_VARIANT[r.status]}>{MEDIA_REQUEST_STATUS_LABELS[r.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{r.services.join(", ")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.location}</p>
                  {r.listing && (
                    <Link href={`/listings/${r.listing.slug}`} className="mt-1 inline-block text-sm text-primary hover:underline">
                      {r.listing.title}
                    </Link>
                  )}
                  {r.preferredDate && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Preferred: {r.preferredDate.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                  {r.notes && <p className="mt-1 text-sm text-muted-foreground">&ldquo;{r.notes}&rdquo;</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.user.phone}
                    {r.user.email ? ` · ${r.user.email}` : ""} · Requested{" "}
                    {r.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {r.status === "NEW" && (
                    <form action={updateMediaRequestStatusAction.bind(null, r.id, "SCHEDULED")}>
                      <Button type="submit" size="sm">Mark scheduled</Button>
                    </form>
                  )}
                  {r.status === "SCHEDULED" && (
                    <form action={updateMediaRequestStatusAction.bind(null, r.id, "DELIVERED")}>
                      <Button type="submit" size="sm">Mark delivered</Button>
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
