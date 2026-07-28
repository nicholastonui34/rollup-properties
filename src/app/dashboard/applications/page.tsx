import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { displayPhone } from "@/lib/phone";
import { APPLICATION_STATUS_BADGE_VARIANT, APPLICATION_STATUS_LABELS } from "@/lib/listing-options";
import { updateApplicationStatusAction } from "./actions";

export const metadata: Metadata = { title: "Rental applications" };

export default async function ApplicationsPage() {
  const session = await auth();
  const applications = await prisma.rentalApplication.findMany({
    where: { pmId: session!.user.id },
    include: { listing: { select: { title: true, slug: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Rental applications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Renters who applied through your microsite. Move each through review.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{a.fullName}</p>
                    <Badge variant={APPLICATION_STATUS_BADGE_VARIANT[a.status]}>
                      {APPLICATION_STATUS_LABELS[a.status]}
                    </Badge>
                  </div>
                  {a.listing && (
                    <Link href={`/listings/${a.listing.slug}`} className="text-sm text-primary hover:underline">
                      {a.listing.title}
                    </Link>
                  )}
                  <p className="mt-1 text-sm text-foreground">
                    {displayPhone(a.phone)} · {a.email}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.occupation} at {a.employer} · {a.monthlyIncomeRange}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Move-in: {a.desiredMoveInDate.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                    {a.occupants} occupant{a.occupants === 1 ? "" : "s"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    <a href={a.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      View ID document
                    </a>
                    {a.incomeDocumentUrl && (
                      <a href={a.incomeDocumentUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                        View income document
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Applied {a.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {a.status === "SUBMITTED" && (
                    <>
                      <form action={updateApplicationStatusAction.bind(null, a.id, "UNDER_REVIEW")}>
                        <Button type="submit" size="sm">Start review</Button>
                      </form>
                      <form action={updateApplicationStatusAction.bind(null, a.id, "DECLINED")}>
                        <Button type="submit" size="sm" variant="outline">Decline</Button>
                      </form>
                    </>
                  )}
                  {a.status === "UNDER_REVIEW" && (
                    <>
                      <form action={updateApplicationStatusAction.bind(null, a.id, "SHORTLISTED")}>
                        <Button type="submit" size="sm">Shortlist</Button>
                      </form>
                      <form action={updateApplicationStatusAction.bind(null, a.id, "DECLINED")}>
                        <Button type="submit" size="sm" variant="outline">Decline</Button>
                      </form>
                    </>
                  )}
                  {a.status === "SHORTLISTED" && (
                    <>
                      <form action={updateApplicationStatusAction.bind(null, a.id, "APPROVED")}>
                        <Button type="submit" size="sm">Approve</Button>
                      </form>
                      <form action={updateApplicationStatusAction.bind(null, a.id, "DECLINED")}>
                        <Button type="submit" size="sm" variant="outline">Decline</Button>
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
